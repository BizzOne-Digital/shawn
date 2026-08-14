import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { BillingInterval } from "@prisma/client";

function getSubscriptionPeriod(sub: Stripe.Subscription) {
  const raw = sub as unknown as {
    current_period_start: number;
    current_period_end: number;
    canceled_at: number | null;
  };
  return {
    start: raw.current_period_start,
    end: raw.current_period_end,
    canceledAt: raw.canceled_at,
  };
}

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.mode === "subscription" && session.subscription) {
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;
      const businessId = session.metadata?.businessId || null;
      const interval = (session.metadata?.interval ?? "MONTHLY") as BillingInterval;

      if (userId && planId) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const period = getSubscriptionPeriod(sub);

        await db.subscription.create({
          data: {
            userId,
            planId,
            businessId,
            status: "ACTIVE",
            billingInterval: interval,
            stripeSubscriptionId: sub.id,
            stripeCustomerId: sub.customer as string,
            currentPeriodStart: new Date(period.start * 1000),
            currentPeriodEnd: new Date(period.end * 1000),
          },
        });

        const plan = await db.membershipPlan.findUnique({ where: { id: planId } });
        if (plan?.businessTier && businessId) {
          await db.business.update({
            where: { id: businessId },
            data: { listingTier: plan.businessTier },
          });
        }
        if (plan?.individualTier) {
          await db.user.update({
            where: { id: userId },
            data: { individualTier: plan.individualTier, memberType: "INDIVIDUAL" },
          });
        }
      }
    } else {
      const userId = session.metadata?.userId;
      const transactionId = session.metadata?.transactionId;

      if (userId && transactionId) {
        const transaction = await db.transaction.findUnique({
          where: { id: transactionId },
        });

        if (transaction && transaction.status === "PENDING") {
          await db.$transaction([
            db.transaction.update({
              where: { id: transactionId },
              data: {
                status: "COMPLETED",
                stripePaymentId: session.payment_intent as string,
              },
            }),
            db.wallet.upsert({
              where: { userId },
              create: { userId, balance: transaction.amount },
              update: { balance: { increment: transaction.amount } },
            }),
          ]);
        }
      }
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const existing = await db.subscription.findFirst({
      where: { stripeSubscriptionId: sub.id },
    });
    if (existing) {
      const period = getSubscriptionPeriod(sub);
      await db.subscription.update({
        where: { id: existing.id },
        data: {
          status: sub.status === "active" ? "ACTIVE" : sub.status === "canceled" ? "CANCELED" : "PAST_DUE",
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          currentPeriodEnd: new Date(period.end * 1000),
          canceledAt: period.canceledAt ? new Date(period.canceledAt * 1000) : null,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
