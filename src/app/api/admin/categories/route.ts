import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi, recordAuditLog, slugify } from "@/lib/admin-utils";

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().optional(),
});

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { subcategories: true, _count: { select: { businesses: true } } },
  });

  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const slug = parsed.data.slug || slugify(parsed.data.name);

  const existing = await db.category.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const category = await db.category.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      icon: parsed.data.icon,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  });

  await recordAuditLog({
    userId: user!.id,
    action: "CREATE_CATEGORY",
    entity: "Category",
    entityId: category.id,
    metadata: { name: category.name },
  });

  return NextResponse.json(category, { status: 201 });
}
