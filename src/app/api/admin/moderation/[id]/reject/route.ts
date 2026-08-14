import { NextResponse } from "next/server";
import { ListingStatus, ModerationActionType } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi, logAdminAction } from "@/lib/admin-utils";
import { notifyBusinessOwner } from "@/lib/moderation-notify";

const schema = z.object({
  message: z.string().min(1, "Rejection reason is required"),
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

  const updated = await db.business.update({
    where: { id },
    data: {
      status: ListingStatus.REJECTED,
      rejectionReason: parsed.data.message,
    },
  });

  await db.listingSubmission.create({
    data: {
      businessId: id,
      status: ListingStatus.REJECTED,
      reviewedAt: new Date(),
      notes: parsed.data.message,
    },
  });

  await logAdminAction({
    userId: user!.id,
    businessId: id,
    moderationAction: ModerationActionType.REJECT,
    message: parsed.data.message,
    auditAction: "REJECT_BUSINESS",
    entity: "Business",
    entityId: id,
  });

  await notifyBusinessOwner(
    id,
    business.name,
    "Rejected",
    parsed.data.message
  );

  return NextResponse.json(updated);
}
