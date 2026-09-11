import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireBusinessOwnerApi, handleApiError } from "@/lib/api-utils";
import { NOT_DELETED } from "@/lib/prisma-mongo-filters";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  imageUrl: z.string().min(1).optional(),
  purchaseUrl: z.string().url().optional(),
  price: z.coerce.number().min(0).optional(),
});

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  try {
    const authResult = await requireBusinessOwnerApi();
    if ("error" in authResult) return authResult.error;

    const { id, productId } = await params;

    const business = await db.business.findFirst({
      where: { id, ownerId: authResult.user.id, ...NOT_DELETED },
    });
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const product = await db.sellerProduct.findFirst({
      where: { id: productId, businessId: id },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await db.sellerProduct.update({
      where: { id: productId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  try {
    const authResult = await requireBusinessOwnerApi();
    if ("error" in authResult) return authResult.error;

    const { id, productId } = await params;
    const business = await db.business.findFirst({
      where: { id, ownerId: authResult.user.id, ...NOT_DELETED },
    });
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const product = await db.sellerProduct.update({
      where: { id: productId },
      data: parsed.data,
    });

    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error);
  }
}
