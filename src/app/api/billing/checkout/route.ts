import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { requireSessionUser, handleApiError } from "@/lib/api-utils";
import { absoluteUrl } from "@/lib/utils";
import { z } from "zod";

const checkoutSchema = z.object({
  amount: z.coerce.number().min(10).max(10000),
});

export async function POST(request: Request) {
  try {
    const result = await requireSessionUser();
    if ("error" in result) return result.error;

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { amount } = checkoutSchema.parse(body);

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const transaction = await db.transaction.create({
      data: {
        userId: result.user.id,
        type: "DEPOSIT",
        status: "PENDING",
        amount,
        description: "Wallet top-up",
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Let's Go Buffalo Wallet Credit",
              description: `Add $${amount.toFixed(2)} to your advertising wallet`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: result.user.id,
        transactionId: transaction.id,
      },
      success_url: absoluteUrl("/dashboard/billing?success=true"),
      cancel_url: absoluteUrl("/dashboard/billing?cancelled=true"),
    });

    await db.transaction.update({
      where: { id: transaction.id },
      data: { stripePaymentId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return handleApiError(error);
  }
}
