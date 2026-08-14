import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi, recordAuditLog } from "@/lib/admin-utils";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  subcategories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    sortOrder: z.number(),
    isActive: z.boolean(),
  })).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  const category = await db.category.findUnique({
    where: { id },
    include: { subcategories: true },
  });

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json(category);
}

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

  const { subcategories, ...categoryData } = parsed.data;

  const category = await db.$transaction(async (tx) => {
    const updated = await tx.category.update({
      where: { id },
      data: categoryData,
    });

    if (subcategories) {
      const existingIds = subcategories
        .filter((s) => !s.id.startsWith("new-"))
        .map((s) => s.id);

      await tx.subcategory.deleteMany({
        where: { categoryId: id, id: { notIn: existingIds } },
      });

      for (const sub of subcategories) {
        if (sub.id.startsWith("new-")) {
          await tx.subcategory.create({
            data: {
              name: sub.name,
              slug: sub.slug,
              sortOrder: sub.sortOrder,
              isActive: sub.isActive,
              categoryId: id,
            },
          });
        } else {
          await tx.subcategory.update({
            where: { id: sub.id },
            data: {
              name: sub.name,
              slug: sub.slug,
              sortOrder: sub.sortOrder,
              isActive: sub.isActive,
            },
          });
        }
      }
    }

    return updated;
  });

  await recordAuditLog({
    userId: user!.id,
    action: "UPDATE_CATEGORY",
    entity: "Category",
    entityId: id,
    metadata: categoryData,
  });

  return NextResponse.json(category);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;

  await db.$transaction([
    db.business.updateMany({ where: { categoryId: id }, data: { categoryId: null, subcategoryId: null } }),
    db.category.delete({ where: { id } }),
  ]);

  await recordAuditLog({
    userId: user!.id,
    action: "DELETE_CATEGORY",
    entity: "Category",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
