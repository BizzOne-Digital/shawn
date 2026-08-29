import { NextResponse } from "next/server";
import {
  requireSessionUser,
  requireOwnedBusiness,
  handleBusinessSaveError,
} from "@/lib/api-utils";
import {
  generateUniqueSlug,
  syncBusinessRelations,
} from "@/lib/business-utils";
import { businessSubmissionSchema, businessDraftSchema } from "@/lib/validations/business";
import type { z } from "zod";

type DraftData = z.infer<typeof businessDraftSchema>;

function buildUpdateFields(data: DraftData) {
  return {
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

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await requireSessionUser();
  if ("error" in result) return result.error;

  const owned = await requireOwnedBusiness(id, result.user.id);
  if ("error" in owned) return owned.error;

  return NextResponse.json(owned.business);
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await requireSessionUser();
    if ("error" in result) return result.error;

    const owned = await requireOwnedBusiness(id, result.user.id);
    if ("error" in owned) return owned.error;

    const body = await request.json();
    const { draft: isDraft, ...rest } = body;
    const data = isDraft
      ? businessDraftSchema.parse(rest)
      : businessSubmissionSchema.parse(rest);

    const slug =
      data.name && data.name !== owned.business.name
        ? await generateUniqueSlug(data.name, id)
        : owned.business.slug;

    const { db } = await import("@/lib/db");
    const business = await db.business.update({
      where: { id },
      data: {
        ...(data.name && data.name !== owned.business.name
          ? { name: data.name, slug }
          : data.name
            ? { name: data.name }
            : {}),
        ...buildUpdateFields(data),
      },
    });

    await syncBusinessRelations(id, data);

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

    return NextResponse.json(full);
  } catch (error) {
    return handleBusinessSaveError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await requireSessionUser();
  if ("error" in result) return result.error;

  const owned = await requireOwnedBusiness(id, result.user.id);
  if ("error" in owned) return owned.error;

  const { db } = await import("@/lib/db");
  await db.business.update({
    where: { id },
    data: { deletedAt: new Date(), status: "ARCHIVED" },
  });

  return NextResponse.json({ success: true });
}
