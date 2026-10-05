import { db } from "@/lib/db";
import { TERMS_VERSION } from "@/lib/constants/terms";
import { absoluteUrl } from "@/lib/utils";
import { getStripeClient, isStripeConfigured, isStripeLiveMode } from "@/lib/stripe";
import { BillingInterval } from "@prisma/client";
import type Stripe from "stripe";

/** Membership plan used for custom @LetsGoBuffalo.com email billing (no site login required). */
export const LGB_EMAIL_PLAN_SLUG = "individual-pro";

export async function getLgbEmailPlan() {
  return db.membershipPlan.findFirst({
    where: { slug: LGB_EMAIL_PLAN_SLUG, isActive: true },
  });
}

export async function createLgbEmailCheckoutSession(options: {
  contactEmail: string;
  contactName?: string;
  leadId?: string;
  interval: BillingInterval;
  termsAcceptedAt: Date;
}): Promise<{ url: string | null }> {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured");
  }

  const plan = await getLgbEmailPlan();
  if (!plan) {
    throw new Error("Email plan not found");
  }

  const amount =
    options.interval === BillingInterval.MONTHLY
      ? Number(plan.monthlyPrice)
      : Number(plan.yearlyPrice);

  if (amount === 0) {
    throw new Error("This plan is free — no checkout required");
  }

  const stripe = getStripeClient();
  const priceId =
    options.interval === BillingInterval.MONTHLY
      ? plan.stripeMonthlyPriceId
      : plan.stripeYearlyPriceId;

  if (isStripeLiveMode() && !priceId) {
    throw new Error(
      "This plan is not linked to Stripe yet. Run sync-stripe-plans or add price IDs in Admin → Plans & Pricing."
    );
  }

  const productName = "Custom @LetsGoBuffalo.com Email";
  const productDescription =
    "Monthly or annual subscription for your custom Let's Go Buffalo email with forwarding. Site membership is not required.";

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: Math.round(amount * 100),
            recurring: {
              interval: options.interval === BillingInterval.MONTHLY ? "month" : "year",
            },
          },
          quantity: 1,
        },
      ];

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: options.contactEmail,
    line_items: lineItems,
    success_url: absoluteUrl("/email-enrollment?subscribed=1"),
    cancel_url: absoluteUrl("/email-enrollment?cancelled=1"),
    metadata: {
      lgbEmailCheckout: "true",
      contactEmail: options.contactEmail,
      contactName: options.contactName ?? "",
      leadId: options.leadId ?? "",
      planId: plan.id,
      planSlug: plan.slug,
      interval: options.interval,
      termsVersion: TERMS_VERSION,
      termsAcceptedAt: options.termsAcceptedAt.toISOString(),
    },
    subscription_data: {
      metadata: {
        lgbEmailCheckout: "true",
        contactEmail: options.contactEmail,
        leadId: options.leadId ?? "",
        planId: plan.id,
      },
    },
  });

  return { url: session.url };
}
