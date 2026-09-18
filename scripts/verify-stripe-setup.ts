import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config();

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  const webhook = process.env.STRIPE_WEBHOOK_SECRET;
  const pub = process.env.STRIPE_PUBLISHABLE_KEY;

  console.log("STRIPE_SECRET_KEY:", key ? `${key.slice(0, 12)}...${key.slice(-4)}` : "MISSING");
  console.log(
    "STRIPE_PUBLISHABLE_KEY:",
    pub ? `set (${pub.startsWith("pk_live") ? "live" : "test"})` : "MISSING"
  );
  console.log("STRIPE_WEBHOOK_SECRET:", webhook?.trim() ? "set" : "EMPTY — subscriptions/wallet will not activate after checkout");
  console.log("NEXT_PUBLIC_SITE_URL:", process.env.NEXT_PUBLIC_SITE_URL ?? "MISSING");

  if (!key) {
    process.exit(1);
  }

  const stripe = new Stripe(key);
  const balance = await stripe.balance.retrieve();
  console.log("\nStripe API OK (livemode:", balance.livemode, ")");

  const prices = await stripe.prices.list({ limit: 50, active: true, expand: ["data.product"] });
  console.log(`\nActive Stripe prices: ${prices.data.length}`);

  const prisma = new PrismaClient();
  const plans = await prisma.membershipPlan.findMany({ orderBy: { sortOrder: "asc" } });

  console.log("\nMembership plans vs Stripe price IDs:");
  for (const plan of plans) {
    const paid = plan.monthlyPrice > 0 || plan.yearlyPrice > 0;
    const hasIds = plan.stripeMonthlyPriceId || plan.stripeYearlyPriceId;
    const status = !paid ? "free" : hasIds ? "linked" : "NEEDS price_ IDs in Admin → Plans";
    console.log(`  ${plan.slug}: ${status}`);
    if (plan.stripeMonthlyPriceId) console.log(`    monthly: ${plan.stripeMonthlyPriceId}`);
    if (plan.stripeYearlyPriceId) console.log(`    yearly: ${plan.stripeYearlyPriceId}`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
