import { db } from "@/lib/db";

const DEFAULT_MINIMUM_DAILY_BID = 0.25;

export async function getMinimumDailyBid(): Promise<number> {
  try {
    const setting = await db.siteSetting.findUnique({
      where: { key: "ad_minimum_daily_bid" },
    });
    const value = Number(setting?.value ?? DEFAULT_MINIMUM_DAILY_BID);
    return value > 0 ? value : DEFAULT_MINIMUM_DAILY_BID;
  } catch {
    return DEFAULT_MINIMUM_DAILY_BID;
  }
}

export function formatMinimumBid(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
