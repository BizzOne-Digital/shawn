/**
 * Creates Stripe Products + recurring Prices for paid membership plans and saves price_ IDs in MongoDB.
 * Run: npx tsx scripts/sync-stripe-plans.ts
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

config();

async function ensurePrice(
  stripe: Stripe,
  productId: string,
  planSlug: string,
  interval: "month" | "year",
  amountUsd: number,
  existingPriceId: string | null | undefined
): Promise<string> {
  if (existingPriceId) {
    try {
      const existing = await stripe.prices.retrieve(existingPriceId);
      if (existing.active) return existing.id;
    } catch {
      /* create new below */
    }
  }

  const price = await stripe.prices.create({
    product: productId,
    currency: "usd",
    unit_amount: Math.round(amountUsd * 100),
    recurring: { interval },
    metadata: {
      planSlug,
      billingInterval: interval === "month" ? "MONTHLY" : "YEARLY",
    },
  });
  return price.id;
}

async function main() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    console.error("Missing STRIPE_SECRET_KEY in .env");
    process.exit(1);
  }

  const stripe = new Stripe(key);
  const prisma = new PrismaClient();

  const plans = await prisma.membershipPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  for (const plan of plans) {
    const needsMonthly = plan.monthlyPrice > 0;
    const needsYearly = plan.yearlyPrice > 0;
    if (!needsMonthly && !needsYearly) {
      console.log(`Skip (free): ${plan.slug}`);
      continue;
    }

    let productId: string | undefined;
    const linkedPriceId = plan.stripeMonthlyPriceId ?? plan.stripeYearlyPriceId;
    if (linkedPriceId) {
      try {
        const price = await stripe.prices.retrieve(linkedPriceId, { expand: ["product"] });
        const product = price.product as Stripe.Product;
        productId = typeof product === "string" ? product : product.id;
      } catch {
        productId = undefined;
      }
    }

    if (!productId) {
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description ?? `${plan.name} — Let's Go Buffalo membership`,
        metadata: { planSlug: plan.slug, planId: plan.id },
      });
      productId = product.id;
      console.log(`Created product for ${plan.slug}: ${productId}`);
    }

    const stripeMonthlyPriceId = needsMonthly
      ? await ensurePrice(
          stripe,
          productId,
          plan.slug,
          "month",
          plan.monthlyPrice,
          plan.stripeMonthlyPriceId
        )
      : plan.stripeMonthlyPriceId;

    const stripeYearlyPriceId = needsYearly
      ? await ensurePrice(
          stripe,
          productId,
          plan.slug,
          "year",
          plan.yearlyPrice,
          plan.stripeYearlyPriceId
        )
      : plan.stripeYearlyPriceId;

    await prisma.membershipPlan.update({
      where: { id: plan.id },
      data: { stripeMonthlyPriceId, stripeYearlyPriceId },
    });

    console.log(`Updated ${plan.slug}:`);
    if (stripeMonthlyPriceId) console.log(`  monthly: ${stripeMonthlyPriceId}`);
    if (stripeYearlyPriceId) console.log(`  yearly: ${stripeYearlyPriceId}`);
  }

  await prisma.$disconnect();
  console.log("\nDone. Enter these price IDs in Admin → Plans if you edit plans manually later (DB is already updated).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
