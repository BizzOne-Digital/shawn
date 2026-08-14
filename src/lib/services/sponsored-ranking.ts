import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { CampaignStatus, TargetType } from "@prisma/client";
import {
  rankCampaigns,
  hasSufficientBalance,
  DEFAULT_RANKING_CONFIG,
  type SponsoredSearchContext,
  type SponsoredRankingConfig,
  type EligibleCampaign,
} from "./sponsored-ranking-core";

export type { SponsoredSearchContext, SponsoredRankingConfig, EligibleCampaign } from "./sponsored-ranking-core";
export { rankCampaigns, hasSufficientBalance } from "./sponsored-ranking-core";

export interface SponsoredResult {
  businessId: string;
  campaignId: string;
  bidId: string;
  dailyBid: number;
  position: number;
  business: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    description: string | null;
    city: string | null;
    phone: string | null;
    website: string | null;
    isVerified: boolean;
    category: { name: string; slug: string } | null;
    images: { url: string; type: string }[];
  };
}

export async function getSponsoredRankingConfig(): Promise<SponsoredRankingConfig> {
  try {
    const settings = await db.siteSetting.findMany({
      where: {
        key: {
          in: ["ad_max_positions", "ad_minimum_daily_bid", "ad_tie_break_earliest"],
        },
      },
    });

    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

    return {
      maxPositions: Math.min(Number(map.ad_max_positions ?? 3), 3),
      minimumDailyBid: Number(map.ad_minimum_daily_bid ?? 0.25),
      tieBreakByEarliestBid: map.ad_tie_break_earliest !== false,
    };
  } catch {
    return DEFAULT_RANKING_CONFIG;
  }
}

function campaignMatchesContext(
  targets: { targetType: TargetType; value: string | null }[],
  context: SponsoredSearchContext
): boolean {
  if (targets.length === 0) return true;

  const hasAll = targets.some((t) => t.targetType === TargetType.ALL);
  if (hasAll) return true;

  return targets.some((target) => {
    switch (target.targetType) {
      case TargetType.KEYWORD:
        return (
          context.query &&
          target.value &&
          context.query.toLowerCase().includes(target.value.toLowerCase())
        );
      case TargetType.CATEGORY:
        return (
          (context.categoryId && target.value === context.categoryId) ||
          (context.categorySlug && target.value === context.categorySlug)
        );
      case TargetType.LOCATION:
        return (
          (context.locationId && target.value === context.locationId) ||
          (context.city &&
            target.value &&
            context.city.toLowerCase() === target.value.toLowerCase())
        );
      default:
        return false;
    }
  });
}

export async function getEligibleCampaigns(
  context: SponsoredSearchContext = {}
): Promise<EligibleCampaign[]> {
  const config = await getSponsoredRankingConfig();
  const now = new Date();

  const campaigns = await db.advertisingCampaign.findMany({
    where: {
      status: CampaignStatus.ACTIVE,
      startDate: { lte: now },
      OR: [{ endDate: null }, { endDate: { gte: now } }],
      dailyBid: { gte: config.minimumDailyBid },
    },
    include: {
      business: {
        select: {
          id: true,
          status: true,
          deletedAt: true,
        },
      },
      owner: {
        include: { wallet: true },
      },
      targets: true,
      bids: {
        where: { isActive: true },
        orderBy: { amount: "desc" },
        take: 1,
      },
    },
  });

  const eligible: EligibleCampaign[] = [];

  for (const campaign of campaigns) {
    if (campaign.business.deletedAt) continue;
    if (campaign.business.status !== "PUBLISHED") continue;
    if (!campaignMatchesContext(campaign.targets, context)) continue;

    const walletBalance = campaign.owner.wallet
      ? Number(campaign.owner.wallet.balance)
      : 0;
    const dailyBid = Number(campaign.dailyBid);

    if (!hasSufficientBalance(walletBalance, dailyBid)) continue;

    const activeBid = campaign.bids[0];
    eligible.push({
      campaignId: campaign.id,
      businessId: campaign.businessId,
      bidId: activeBid?.id ?? campaign.id,
      dailyBid: activeBid ? Number(activeBid.amount) : dailyBid,
      bidCreatedAt: activeBid?.createdAt ?? campaign.createdAt,
      ownerId: campaign.ownerId,
    });
  }

  return eligible;
}

export async function getSponsoredResults(
  context: SponsoredSearchContext = {}
): Promise<SponsoredResult[]> {
  const config = await getSponsoredRankingConfig();
  const eligible = await getEligibleCampaigns(context);
  const winners = rankCampaigns(eligible, config);

  if (winners.length === 0) return [];

  const businessIds = winners.map((w) => w.businessId);
  const businesses = await db.business.findMany({
    where: { id: { in: businessIds } },
    include: {
      category: { select: { name: true, slug: true } },
      images: { where: { type: "LOGO" }, take: 1 },
    },
  });

  const businessMap = new Map(businesses.map((b) => [b.id, b]));

  return winners.map((winner, index) => {
    const business = businessMap.get(winner.businessId)!;
    return {
      businessId: winner.businessId,
      campaignId: winner.campaignId,
      bidId: winner.bidId,
      dailyBid: winner.dailyBid,
      position: index + 1,
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        shortDescription: business.shortDescription,
        description: business.description,
        city: business.city,
        phone: business.phone,
        website: business.website,
        isVerified: business.isVerified,
        category: business.category,
        images: business.images.map((i) => ({ url: i.url, type: i.type })),
      },
    };
  });
}

export async function recordAdImpressions(
  results: SponsoredResult[],
  query?: string
): Promise<void> {
  if (results.length === 0) return;

  await db.$transaction([
    db.adImpression.createMany({
      data: results.map((r) => ({
        campaignId: r.campaignId,
        businessId: r.businessId,
        query,
        position: r.position,
      })),
    }),
    ...results.map((r) =>
      db.advertisingCampaign.update({
        where: { id: r.campaignId },
        data: { impressions: { increment: 1 } },
      })
    ),
  ]);
}

export async function recordAdClick(
  campaignId: string,
  businessId: string,
  position: number,
  query?: string
): Promise<void> {
  await db.$transaction([
    db.adClick.create({
      data: { campaignId, businessId, position, query },
    }),
    db.advertisingCampaign.update({
      where: { id: campaignId },
      data: { clicks: { increment: 1 } },
    }),
  ]);
}

export function decimalToNumber(value: Prisma.Decimal | number | string): number {
  return typeof value === "number" ? value : Number(value);
}
