import { NextResponse } from "next/server";
import { z } from "zod";
import { BillingInterval } from "@prisma/client";
import { handleApiError } from "@/lib/api-utils";
import { isStripeConfigured } from "@/lib/stripe";
import { createLgbEmailCheckoutSession } from "@/lib/lgb-email-billing";

const checkoutSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  name: z.string().max(120).optional(),
  leadId: z.string().min(1).optional(),
  interval: z.enum(["MONTHLY", "YEARLY"]),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the Terms & Conditions" }),
  }),
});

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: "Online payment is not available right now." }, { status: 503 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.parse(body);
    const termsAcceptedAt = new Date();

    const { url } = await createLgbEmailCheckoutSession({
      contactEmail: parsed.email.trim().toLowerCase(),
      contactName: parsed.name?.trim(),
      leadId: parsed.leadId,
      interval: parsed.interval as BillingInterval,
      termsAcceptedAt,
    });

    if (!url) {
      return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
    }

    return NextResponse.json({ url });
  } catch (error) {
    return handleApiError(error);
  }
}
