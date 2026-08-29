import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { requireSessionUser, handleApiError } from "@/lib/api-utils";
import { absoluteUrl } from "@/lib/utils";
import { z } from "zod";
import { BillingInterval } from "@prisma/client";

const subscribeSchema = z.object({
  planSlug: z.string().min(1),
  interval: z.enum(["MONTHLY", "YEARLY"]),
  businessId: z.string().optional(),
  promoCode: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const result = await requireSessionUser();
    if ("error" in result) return result.error;

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
    }

    const body = await request.json();
    const { planSlug, interval, businessId, promoCode } = subscribeSchema.parse(body);

    const dbUser = await db.user.findUnique({ where: { id: result.user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const plan = await db.membershipPlan.findUnique({ where: { slug: planSlug, isActive: true } });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const amount = interval === BillingInterval.MONTHLY
      ? Number(plan.monthlyPrice)
      : Number(plan.yearlyPrice);

    if (amount === 0) {
      return NextResponse.json({ error: "This plan is free — no subscription required" }, { status: 400 });
    }

    let promoCodeRecord = null;
    if (promoCode) {
      promoCodeRecord = await db.promoCode.findFirst({
        where: {
          code: promoCode.toUpperCase(),
          isActive: true,
          OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
        },
      });
      if (!promoCodeRecord) {
        return NextResponse.json({ error: "Invalid promo code" }, { status: 400 });
      }
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    let customerId = dbUser.stripeCustomerId ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: dbUser.email,
        name: dbUser.name ?? undefined,
        metadata: { userId: dbUser.id },
      });
      customerId = customer.id;
      await db.user.update({
        where: { id: dbUser.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceId = interval === BillingInterval.MONTHLY
      ? plan.stripeMonthlyPriceId
      : plan.stripeYearlyPriceId;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [{
          price_data: {
            currency: "usd",
            product_data: {
              name: plan.name,
              description: plan.description ?? undefined,
            },
            unit_amount: Math.round(amount * 100),
            recurring: {
              interval: interval === BillingInterval.MONTHLY ? "month" : "year",
            },
          },
          quantity: 1,
        }];

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      customer: customerId,
      line_items: lineItems,
      success_url: absoluteUrl(
        businessId
          ? `/dashboard/submit?draft=${businessId}&upgraded=true`
          : "/dashboard/billing?subscribed=true"
      ),
      cancel_url: absoluteUrl("/pricing?cancelled=true"),
      metadata: {
        userId: result.user.id,
        planId: plan.id,
        planSlug: plan.slug,
        businessId: businessId ?? "",
        interval,
      },
      subscription_data: {
        metadata: {
          userId: result.user.id,
          planId: plan.id,
          businessId: businessId ?? "",
        },
      },
    };

    if (promoCodeRecord?.type === "FREE_TRIAL_DAYS") {
      sessionParams.subscription_data!.trial_period_days = Number(promoCodeRecord.value);
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return handleApiError(error);
  }
}
