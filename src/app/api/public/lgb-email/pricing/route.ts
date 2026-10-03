import { NextResponse } from "next/server";
import { getLgbEmailPlan } from "@/lib/lgb-email-billing";

export async function GET() {
  const plan = await getLgbEmailPlan();
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  return NextResponse.json({
    planName: plan.name,
    monthlyPrice: Number(plan.monthlyPrice),
    yearlyPrice: Number(plan.yearlyPrice),
    stripeConfigured: Boolean(plan.stripeMonthlyPriceId || plan.stripeYearlyPriceId),
  });
}
