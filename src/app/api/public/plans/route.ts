import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    const plans = await db.membershipPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({
      plans: plans.map((plan) => ({
        ...plan,
        monthlyPrice: Number(plan.monthlyPrice),
        yearlyPrice: Number(plan.yearlyPrice),
        features: (plan.features as string[]) ?? [],
      })),
    });
  }

  const plan = await db.membershipPlan.findFirst({
    where: { slug, isActive: true },
  });

  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  return NextResponse.json({
    plan: {
      ...plan,
      monthlyPrice: Number(plan.monthlyPrice),
      yearlyPrice: Number(plan.yearlyPrice),
      features: (plan.features as string[]) ?? [],
    },
  });
}
