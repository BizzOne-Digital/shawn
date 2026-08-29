import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi, recordAuditLog } from "@/lib/admin-utils";

const schema = z.object({
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
});

export async function POST(request: Request) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const { sourceId, targetId } = parsed.data;

  if (sourceId === targetId) {
    return NextResponse.json({ error: "Cannot merge category into itself" }, { status: 400 });
  }

  const [source, target] = await Promise.all([
    db.category.findUnique({ where: { id: sourceId } }),
    db.category.findUnique({ where: { id: targetId } }),
  ]);

  if (!source || !target) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  await db.$transaction(async (tx) => {
    await tx.business.updateMany({
      where: { categoryId: sourceId },
      data: { categoryId: targetId, subcategoryId: null },
    });
    await tx.subcategory.deleteMany({ where: { categoryId: sourceId } });
    await tx.category.delete({ where: { id: sourceId } });
  });

  await recordAuditLog({
    userId: user!.id,
    action: "MERGE_CATEGORIES",
    entity: "Category",
    entityId: targetId,
    metadata: { sourceId, sourceName: source.name, targetName: target.name },
  });

  return NextResponse.json({ success: true, targetId });
}
