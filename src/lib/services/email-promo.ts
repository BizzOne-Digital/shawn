import { PromoCodeScope } from "@prisma/client";
import { db } from "@/lib/db";

export async function findActiveEmailPromoCode(code: string) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  const promo = await db.promoCode.findFirst({
    where: {
      code: normalized,
      scope: PromoCodeScope.LGB_EMAIL,
      isActive: true,
      OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
    },
  });

  if (!promo) return null;

  if (promo.maxRedemptions != null && promo.redemptionCount >= promo.maxRedemptions) {
    return null;
  }

  return promo;
}

export function formatEmailPromoSummary(type: string, value: number): string {
  if (type === "PERCENTAGE") return `${value}% off custom email`;
  if (type === "FIXED_AMOUNT") return `$${value.toFixed(2)} off custom email`;
  if (type === "FREE_TRIAL_DAYS") return `${value} day(s) promotional period`;
  return "Discount applied";
}
