import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  requireSessionUser,
  handleApiError,
} from "@/lib/api-utils";
import { campaignSchema } from "@/lib/validations/business";
import { NOT_DELETED } from "@/lib/prisma-mongo-filters";
import { getMinimumDailyBid } from "@/lib/services/ad-settings";

export async function GET() {
  const result = await requireSessionUser();
  if ("error" in result) return result.error;

  const campaigns = await db.advertisingCampaign.findMany({
    where: { ownerId: result.user.id },
    include: {
      business: { select: { id: true, name: true, slug: true } },
      targets: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(campaigns);
}

export async function POST(request: Request) {
  try {
    const result = await requireSessionUser();
    if ("error" in result) return result.error;

    const body = await request.json();
    const data = campaignSchema.parse(body);

    const minimumDailyBid = await getMinimumDailyBid();
    if (Number(data.dailyBid) < minimumDailyBid) {
      return NextResponse.json(
        { error: `Minimum bid is $${minimumDailyBid.toFixed(2)} per category per day` },
        { status: 400 }
      );
    }

    const business = await db.business.findFirst({
      where: {
        id: data.businessId,
        ownerId: result.user.id,
        ...NOT_DELETED,
        status: { in: ["APPROVED", "PUBLISHED"] },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found or not eligible for advertising" },
        { status: 400 }
      );
    }

    const wallet = await db.wallet.findUnique({
      where: { userId: result.user.id },
    });

    const categories = await db.category.findMany({
      where: { id: { in: data.categoryIds }, isActive: true },
      select: { id: true, name: true },
    });

    if (categories.length !== data.categoryIds.length) {
      return NextResponse.json(
        { error: "One or more selected categories are invalid" },
        { status: 400 }
      );
    }

    const requiredBalance = Number(data.dailyBid) * categories.length;
    if (!wallet || Number(wallet.balance) < requiredBalance) {
      return NextResponse.json(
        {
          error: `Insufficient wallet balance. You need at least $${requiredBalance.toFixed(2)} ($${Number(data.dailyBid).toFixed(2)} per category × ${categories.length}).`,
        },
        { status: 400 }
      );
    }

    const createdCampaigns = [];

    for (const category of categories) {
      const existing = await db.advertisingCampaign.findFirst({
        where: {
          businessId: data.businessId,
          status: { in: ["PENDING_APPROVAL", "ACTIVE", "PAUSED"] },
          targets: {
            some: { targetType: "CATEGORY", value: category.id },
          },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: `This business already has an active bid for ${category.name}. Edit or pause it before creating another.` },
          { status: 400 }
        );
      }

      const campaignName =
        categories.length === 1 ? data.name : `${data.name} — ${category.name}`;

      const campaign = await db.advertisingCampaign.create({
        data: {
          name: campaignName,
          businessId: data.businessId,
          ownerId: result.user.id,
          dailyBid: data.dailyBid,
          totalBudget: data.totalBudget,
          startDate: data.startDate,
          endDate: data.endDate,
          status: "PENDING_APPROVAL",
          targets: {
            create: {
              targetType: "CATEGORY",
              value: category.id,
            },
          },
          bids: {
            create: { amount: data.dailyBid },
          },
        },
        include: {
          business: { select: { id: true, name: true } },
          targets: true,
        },
      });

      createdCampaigns.push(campaign);
    }

    return NextResponse.json(
      { campaigns: createdCampaigns, created: createdCampaigns.length },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
