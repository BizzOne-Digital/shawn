import { NextResponse } from "next/server";
import { ListingStatus, ModerationActionType } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdminApi, logAdminAction } from "@/lib/admin-utils";
import { syncBusinessRelations } from "@/lib/business-utils";
import { notifyBusinessOwner } from "@/lib/moderation-notify";
import { businessSchema } from "../schema";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = businessSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const business = await db.business.findUnique({ where: { id } });
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const isPublishing =
    parsed.data.status === ListingStatus.PUBLISHED &&
    business.status !== ListingStatus.PUBLISHED;

  if (isPublishing && !parsed.data.categoryId && !business.categoryId) {
    return NextResponse.json(
      { error: "Assign a category before publishing" },
      { status: 400 }
    );
  }

  const { images, ...businessData } = parsed.data;

  const updated = await db.business.update({
    where: { id },
    data: {
      ...businessData,
      categoryId: businessData.categoryId || null,
      subcategoryId: businessData.subcategoryId || null,
      ...(isPublishing || (parsed.data.status === ListingStatus.PUBLISHED && !business.publishedAt)
        ? { publishedAt: business.publishedAt ?? new Date(), rejectionReason: null }
        : {}),
    },
  });

  if (images) {
    await syncBusinessRelations(id, { images });
  }

  await logAdminAction({
    userId: user!.id,
    businessId: id,
    moderationAction: ModerationActionType.EDIT,
    auditAction: "UPDATE_BUSINESS",
    entity: "Business",
    entityId: id,
    metadata: businessData,
  });

  if (isPublishing) {
    await notifyBusinessOwner(
      id,
      business.name,
      "Published",
      "Your business listing has been published on Let's Go Buffalo."
    );
  }

  return NextResponse.json(updated);
}
