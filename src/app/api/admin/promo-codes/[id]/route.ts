import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-utils";
import { z } from "zod";

const updatePromoSchema = z.object({
  isActive: z.boolean().optional(),
  maxRedemptions: z.number().int().positive().nullable().optional(),
  validUntil: z.string().datetime().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = updatePromoSchema.parse(await request.json());

  const promo = await db.promoCode.update({
    where: { id },
    data: {
      ...body,
      validUntil: body.validUntil === null ? null : body.validUntil ? new Date(body.validUntil) : undefined,
    },
  });

  return NextResponse.json(promo);
}
