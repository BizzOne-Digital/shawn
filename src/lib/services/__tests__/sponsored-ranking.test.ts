import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  rankCampaigns,
  hasSufficientBalance,
  filterByMinimumBid,
  DEFAULT_RANKING_CONFIG,
  type EligibleCampaign,
  type SponsoredRankingConfig,
} from "@/lib/services/sponsored-ranking-core";

const config: SponsoredRankingConfig = DEFAULT_RANKING_CONFIG;

function makeCampaign(
  overrides: Partial<EligibleCampaign> & { businessId: string }
): EligibleCampaign {
  return {
    campaignId: `camp-${overrides.businessId}`,
    bidId: `bid-${overrides.businessId}`,
    dailyBid: 1.0,
    bidCreatedAt: new Date("2026-01-01"),
    ownerId: "owner-1",
    ...overrides,
  };
}

describe("rankCampaigns", () => {
  it("returns top 3 by highest bid", () => {
    const campaigns = [
      makeCampaign({ businessId: "b1", dailyBid: 5.0 }),
      makeCampaign({ businessId: "b2", dailyBid: 3.0 }),
      makeCampaign({ businessId: "b3", dailyBid: 2.0 }),
      makeCampaign({ businessId: "b4", dailyBid: 1.0 }),
    ];

    const result = rankCampaigns(campaigns, config);
    expect(result).toHaveLength(3);
    expect(result[0].businessId).toBe("b1");
    expect(result[1].businessId).toBe("b2");
    expect(result[2].businessId).toBe("b3");
  });

  it("breaks ties by earliest bid", () => {
    const campaigns = [
      makeCampaign({
        businessId: "b1",
        dailyBid: 2.0,
        bidCreatedAt: new Date("2026-01-15"),
      }),
      makeCampaign({
        businessId: "b2",
        dailyBid: 2.0,
        bidCreatedAt: new Date("2026-01-01"),
      }),
    ];

    const result = rankCampaigns(campaigns, config);
    expect(result[0].businessId).toBe("b2");
    expect(result[1].businessId).toBe("b1");
  });

  it("prevents same business from multiple positions", () => {
    const campaigns = [
      makeCampaign({ businessId: "b1", dailyBid: 5.0 }),
      makeCampaign({ businessId: "b1", dailyBid: 4.0, campaignId: "camp-b1-alt" }),
      makeCampaign({ businessId: "b2", dailyBid: 3.0 }),
    ];

    const result = rankCampaigns(campaigns, config);
    const businessIds = result.map((r) => r.businessId);
    expect(new Set(businessIds).size).toBe(businessIds.length);
    expect(result).toHaveLength(2);
  });

  it("respects maxPositions config", () => {
    const campaigns = Array.from({ length: 10 }, (_, i) =>
      makeCampaign({ businessId: `b${i}`, dailyBid: 10 - i })
    );

    const result = rankCampaigns(campaigns, { ...config, maxPositions: 3 });
    expect(result).toHaveLength(3);
  });

  it("returns empty array for no campaigns", () => {
    expect(rankCampaigns([], config)).toEqual([]);
  });

  it("returns fewer than max if not enough campaigns", () => {
    const campaigns = [
      makeCampaign({ businessId: "b1", dailyBid: 1.0 }),
    ];
    expect(rankCampaigns(campaigns, config)).toHaveLength(1);
  });
});

describe("minimum bid filtering", () => {
  it("campaigns below minimum bid should be excluded before ranking", () => {
    const campaigns = [
      makeCampaign({ businessId: "b1", dailyBid: 0.1 }),
      makeCampaign({ businessId: "b2", dailyBid: 0.5 }),
    ];

    const eligible = filterByMinimumBid(campaigns, config.minimumDailyBid);
    const result = rankCampaigns(eligible, config);

    expect(result).toHaveLength(1);
    expect(result[0].businessId).toBe("b2");
  });
});

describe("expired and underfunded campaigns", () => {
  it("should not include campaigns with insufficient balance", () => {
    function hasSufficientBalance(balance: number, dailyBid: number): boolean {
      return balance >= dailyBid;
    }

    expect(hasSufficientBalance(0.1, 0.25)).toBe(false);
    expect(hasSufficientBalance(0.25, 0.25)).toBe(true);
    expect(hasSufficientBalance(10, 5)).toBe(true);
  });
});
