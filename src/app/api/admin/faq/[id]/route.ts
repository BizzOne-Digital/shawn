import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi, recordAuditLog } from "@/lib/admin-utils";

const schema = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const entry = await db.faqEntry.update({
    where: { id },
    data: {
      ...(parsed.data.question !== undefined ? { question: parsed.data.question.trim() } : {}),
      ...(parsed.data.answer !== undefined ? { answer: parsed.data.answer.trim() } : {}),
      ...(parsed.data.sortOrder !== undefined ? { sortOrder: parsed.data.sortOrder } : {}),
      ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {}),
    },
  });

  await recordAuditLog({
    userId: user!.id,
    action: "UPDATE_FAQ",
    entity: "FaqEntry",
    entityId: id,
    metadata: parsed.data,
  });

  return NextResponse.json(entry);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  await db.faqEntry.delete({ where: { id } });

  await recordAuditLog({
    userId: user!.id,
    action: "DELETE_FAQ",
    entity: "FaqEntry",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
