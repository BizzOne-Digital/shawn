import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-utils";
import { z } from "zod";

const updatePlanSchema = z.object({
  monthlyPrice: z.number().min(0).optional(),
  yearlyPrice: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  isPreLaunchPricing: z.boolean().optional(),
  description: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = updatePlanSchema.parse(await request.json());

  const plan = await db.membershipPlan.update({
    where: { id },
    data: body,
  });

  await db.auditLog.create({
    data: {
      userId: auth.user!.id,
      action: "UPDATE_PLAN_PRICING",
      entity: "MembershipPlan",
      entityId: id,
      metadata: body,
    },
  });

  return NextResponse.json(plan);
}
