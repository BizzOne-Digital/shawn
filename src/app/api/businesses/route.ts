import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireBusinessOwner } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-utils";
import {
  generateUniqueSlug,
  syncBusinessRelations,
} from "@/lib/business-utils";
import { businessDraftSchema } from "@/lib/validations/business";
import { z } from "zod";

function buildBusinessData(data: z.infer<typeof businessDraftSchema>) {
  return {
    ...(data.name && { name: data.name }),
    ...(data.phone !== undefined && { phone: data.phone }),
    ...(data.publicEmail !== undefined && { publicEmail: data.publicEmail || null }),
    ...(data.website !== undefined && { website: data.website || null }),
    ...(data.categoryId !== undefined && { categoryId: data.categoryId || null }),
    ...(data.subcategoryId !== undefined && { subcategoryId: data.subcategoryId || null }),
    ...(data.suggestedCategory !== undefined && {
      suggestedCategory: data.suggestedCategory || null,
    }),
    ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.services !== undefined && { services: data.services }),
    ...(data.tags !== undefined && { tags: data.tags }),
    ...(data.address !== undefined && { address: data.address }),
    ...(data.addressLine2 !== undefined && { addressLine2: data.addressLine2 || null }),
    ...(data.city !== undefined && { city: data.city }),
    ...(data.state !== undefined && { state: data.state }),
    ...(data.zipCode !== undefined && { zipCode: data.zipCode }),
    ...(data.locationId !== undefined && { locationId: data.locationId || null }),
  };
}

export async function GET() {
  const user = await requireBusinessOwner();

  const businesses = await db.business.findMany({
    where: { ownerId: user.id, deletedAt: null },
    include: {
      category: { select: { name: true } },
      images: { where: { type: "LOGO" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(businesses);
}

export async function POST(request: Request) {
  try {
    const user = await requireBusinessOwner();
    const body = await request.json();
    const { draft: _draft, ...rest } = body;
    const data = businessDraftSchema.parse(rest);

    if (!data.name || data.name.length < 2) {
      return NextResponse.json(
        { error: "Business name must be at least 2 characters" },
        { status: 400 }
      );
    }

    const slug = await generateUniqueSlug(data.name);

    const business = await db.business.create({
      data: {
        ...buildBusinessData(data),
        name: data.name,
        slug,
        ownerId: user.id,
        status: "DRAFT",
      },
    });

    await syncBusinessRelations(business.id, data);

    const full = await db.business.findUnique({
      where: { id: business.id },
      include: {
        category: true,
        subcategory: true,
        hours: true,
        images: true,
        socialLinks: true,
      },
    });

    return NextResponse.json(full, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
