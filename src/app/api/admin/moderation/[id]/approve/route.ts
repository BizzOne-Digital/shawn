import { NextResponse } from "next/server";
import { ListingStatus, ModerationActionType } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi, logAdminAction } from "@/lib/admin-utils";
import { notifyBusinessOwner } from "@/lib/moderation-notify";

const schema = z.object({
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const business = await db.business.findUnique({ where: { id } });
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const finalCategoryId = parsed.data.categoryId ?? business.categoryId;
  if (!finalCategoryId) {
    return NextResponse.json(
      { error: "Assign a category before publishing" },
      { status: 400 }
    );
  }

  const updated = await db.business.update({
    where: { id },
    data: {
      status: ListingStatus.PUBLISHED,
      publishedAt: business.publishedAt ?? new Date(),
      rejectionReason: null,
      adminFeedback: parsed.data.message ?? null,
      requiresReReview: false,
      categoryId: finalCategoryId,
      subcategoryId: parsed.data.subcategoryId ?? business.subcategoryId,
    },
  });

  await db.listingSubmission.create({
    data: {
      businessId: id,
      status: ListingStatus.PUBLISHED,
      reviewedAt: new Date(),
      notes: parsed.data.message,
    },
  });

  await logAdminAction({
    userId: user!.id,
    businessId: id,
    moderationAction: ModerationActionType.APPROVE,
    message: parsed.data.message,
    auditAction: "APPROVE_BUSINESS",
    entity: "Business",
    entityId: id,
    metadata: { categoryId: finalCategoryId, subcategoryId: parsed.data.subcategoryId },
  });

  await notifyBusinessOwner(
    id,
    business.name,
    "Published",
    parsed.data.message ??
      "Your business listing has been approved and is now live on Let's Go Buffalo."
  );

  return NextResponse.json(updated);
}
