export interface SponsoredSearchContext {
  query?: string;
  categoryId?: string;
  categorySlug?: string;
  locationId?: string;
  city?: string;
}

export interface SponsoredRankingConfig {
  maxPositions: number;
  minimumDailyBid: number;
  tieBreakByEarliestBid: boolean;
}

export interface EligibleCampaign {
  campaignId: string;
  businessId: string;
  bidId: string;
  dailyBid: number;
  bidCreatedAt: Date;
  ownerId: string;
}

export const DEFAULT_RANKING_CONFIG: SponsoredRankingConfig = {
  maxPositions: 3,
  minimumDailyBid: 0.25,
  tieBreakByEarliestBid: true,
};

export function rankCampaigns(
  campaigns: EligibleCampaign[],
  config: SponsoredRankingConfig = DEFAULT_RANKING_CONFIG
): EligibleCampaign[] {
  const sorted = [...campaigns].sort((a, b) => {
    if (b.dailyBid !== a.dailyBid) {
      return b.dailyBid - a.dailyBid;
    }
    if (config.tieBreakByEarliestBid) {
      return a.bidCreatedAt.getTime() - b.bidCreatedAt.getTime();
    }
    return 0;
  });

  const seen = new Set<string>();
  const winners: EligibleCampaign[] = [];

  for (const campaign of sorted) {
    if (seen.has(campaign.businessId)) continue;
    seen.add(campaign.businessId);
    winners.push(campaign);
    if (winners.length >= config.maxPositions) break;
  }

  return winners;
}

export function hasSufficientBalance(walletBalance: number, dailyBid: number): boolean {
  return walletBalance >= dailyBid;
}

export function filterByMinimumBid(
  campaigns: EligibleCampaign[],
  minimumDailyBid: number
): EligibleCampaign[] {
  return campaigns.filter((c) => c.dailyBid >= minimumDailyBid);
}
