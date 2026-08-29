import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-utils";
import { z } from "zod";
import { PromoCodeType } from "@prisma/client";

const createPromoSchema = z.object({
  code: z.string().min(3).max(30),
  description: z.string().optional(),
  type: z.nativeEnum(PromoCodeType),
  value: z.number().min(0),
  maxRedemptions: z.number().int().positive().nullable().optional(),
  applicablePlanIds: z.array(z.string()).optional(),
  validUntil: z.string().datetime().optional(),
});

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  const codes = await db.promoCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(codes);
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  const body = createPromoSchema.parse(await request.json());

  const existing = await db.promoCode.findUnique({
    where: { code: body.code.toUpperCase() },
  });
  if (existing) {
    return NextResponse.json({ error: "Code already exists" }, { status: 409 });
  }

  const promo = await db.promoCode.create({
    data: {
      code: body.code.toUpperCase(),
      description: body.description,
      type: body.type,
      value: body.value,
      maxRedemptions: body.maxRedemptions ?? null,
      applicablePlanIds: body.applicablePlanIds ?? [],
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
    },
  });

  await db.auditLog.create({
    data: {
      userId: auth.user!.id,
      action: "CREATE_PROMO_CODE",
      entity: "PromoCode",
      entityId: promo.id,
    },
  });

  return NextResponse.json(promo, { status: 201 });
}
