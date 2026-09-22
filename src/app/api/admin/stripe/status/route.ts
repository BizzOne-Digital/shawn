import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-utils";
import {
  getStripeCheckoutBaseUrl,
  isStripeConfigured,
  isStripeLiveMode,
  isStripeWebhookConfigured,
} from "@/lib/stripe";
import { db } from "@/lib/db";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  const plans = await prismaPlans();
  const paidPlans = plans.filter((p) => p.monthlyPrice > 0 || p.yearlyPrice > 0);
  const linked = paidPlans.filter((p) => p.stripeMonthlyPriceId || p.stripeYearlyPriceId);

  return NextResponse.json({
    configured: isStripeConfigured(),
    liveMode: isStripeLiveMode(),
    webhookConfigured: isStripeWebhookConfigured(),
    checkoutBaseUrl: getStripeCheckoutBaseUrl(),
    publishableKeySet: Boolean(process.env.STRIPE_PUBLISHABLE_KEY?.trim()),
    paidPlans: paidPlans.length,
    paidPlansLinkedToStripe: linked.length,
    readyForLiveCheckout:
      isStripeConfigured() &&
      isStripeWebhookConfigured() &&
      linked.length === paidPlans.length &&
      !getStripeCheckoutBaseUrl().includes("localhost"),
  });
}

async function prismaPlans() {
  return db.membershipPlan.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      monthlyPrice: true,
      yearlyPrice: true,
      stripeMonthlyPriceId: true,
      stripeYearlyPriceId: true,
    },
    orderBy: { sortOrder: "asc" },
  });
}
