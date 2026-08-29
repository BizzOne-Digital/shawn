import { NextResponse } from "next/server";
import { FanCommentStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi, recordAuditLog } from "@/lib/admin-utils";

const updateSchema = z.object({
  status: z.enum([FanCommentStatus.APPROVED, FanCommentStatus.REJECTED, FanCommentStatus.PENDING]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const existing = await db.fanComment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const comment = await db.fanComment.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  await recordAuditLog({
    userId: user!.id,
    action: `FAN_COMMENT_${parsed.data.status}`,
    entity: "FanComment",
    entityId: comment.id,
    metadata: { postId: comment.postId },
  });

  return NextResponse.json(comment);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  const existing = await db.fanComment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  await db.fanComment.delete({ where: { id } });

  await recordAuditLog({
    userId: user!.id,
    action: "DELETE_FAN_COMMENT",
    entity: "FanComment",
    entityId: id,
    metadata: { postId: existing.postId },
  });

  return NextResponse.json({ success: true });
}
