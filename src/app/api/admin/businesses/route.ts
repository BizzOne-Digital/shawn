import { NextResponse } from "next/server";
import { ListingStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdminApi, slugify, recordAuditLog } from "@/lib/admin-utils";
import { syncBusinessRelations } from "@/lib/business-utils";
import { businessSchema } from "./schema";

export async function POST(request: Request) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const body = await request.json();
  const parsed = businessSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const adminUser = await db.user.findFirst({
    where: { role: { in: ["ADMIN", "MODERATOR"] } },
  });

  const owner = adminUser ?? await db.user.findFirst();
  if (!owner) {
    return NextResponse.json({ error: "No users available as owner" }, { status: 400 });
  }

  const slug = parsed.data.slug || slugify(parsed.data.name);

  const { images, ...businessData } = parsed.data;

  const business = await db.business.create({
    data: {
      ...businessData,
      slug,
      ownerId: owner.id,
      categoryId: businessData.categoryId || null,
      subcategoryId: businessData.subcategoryId || null,
      status: businessData.status ?? ListingStatus.DRAFT,
    },
  });

  if (images?.length) {
    await syncBusinessRelations(business.id, { images });
  }

  await recordAuditLog({
    userId: user!.id,
    action: "CREATE_BUSINESS",
    entity: "Business",
    entityId: business.id,
    metadata: { name: business.name },
  });

  return NextResponse.json(business, { status: 201 });
}
