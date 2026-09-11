import { NextResponse } from "next/server";
import { z } from "zod";
import { BusinessListingTier } from "@prisma/client";
import { db } from "@/lib/db";
import { requireBusinessOwnerApi, requireOwnedBusiness, handleApiError } from "@/lib/api-utils";

const productSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  imageUrl: z.string().min(1, "Product image is required"),
  purchaseUrl: z.string().url("Enter a valid product link"),
  price: z.coerce.number().min(0).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireBusinessOwnerApi();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;
    const owned = await requireOwnedBusiness(id, authResult.user.id);
    if ("error" in owned) return owned.error;

    if (owned.business.listingTier !== BusinessListingTier.SELLER) {
      return NextResponse.json({ error: "Seller listing tier required" }, { status: 403 });
    }

    const products = await db.sellerProduct.findMany({
      where: { businessId: id, isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireBusinessOwnerApi();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;
    const owned = await requireOwnedBusiness(id, authResult.user.id);
    if ("error" in owned) return owned.error;

    if (owned.business.listingTier !== BusinessListingTier.SELLER) {
      return NextResponse.json({ error: "Seller listing tier required" }, { status: 403 });
    }

    const existingCount = await db.sellerProduct.count({
      where: { businessId: id, isActive: true },
    });
    if (existingCount >= 10) {
      return NextResponse.json({ error: "Maximum 10 product images allowed" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const product = await db.sellerProduct.create({
      data: {
        businessId: id,
        name: parsed.data.name,
        description: parsed.data.description,
        imageUrl: parsed.data.imageUrl,
        purchaseUrl: parsed.data.purchaseUrl,
        price: parsed.data.price,
        sortOrder: existingCount,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
