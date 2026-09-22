import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi, recordAuditLog } from "@/lib/admin-utils";

const schema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  sortOrder: z.number().int().optional(),
});

export async function POST(request: Request) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const maxOrder = await db.faqEntry.aggregate({ _max: { sortOrder: true } });
  const sortOrder = parsed.data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1;

  const entry = await db.faqEntry.create({
    data: {
      question: parsed.data.question.trim(),
      answer: parsed.data.answer.trim(),
      sortOrder,
    },
  });

  await recordAuditLog({
    userId: user!.id,
    action: "CREATE_FAQ",
    entity: "FaqEntry",
    entityId: entry.id,
  });

  return NextResponse.json(entry, { status: 201 });
}
