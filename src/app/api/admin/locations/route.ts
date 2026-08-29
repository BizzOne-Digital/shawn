import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi, recordAuditLog, slugify } from "@/lib/admin-utils";

const schema = z.object({
  city: z.string().min(1),
  state: z.string().default("NY"),
  zipCode: z.string().optional(),
  region: z.string().default("Western New York"),
});

export async function POST(request: Request) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const slug = slugify(`${parsed.data.city}-${parsed.data.state}`);

  const existing = await db.location.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Location already exists" }, { status: 409 });
  }

  const location = await db.location.create({
    data: {
      city: parsed.data.city,
      state: parsed.data.state,
      zipCode: parsed.data.zipCode,
      region: parsed.data.region,
      slug,
    },
  });

  await recordAuditLog({
    userId: user!.id,
    action: "CREATE_LOCATION",
    entity: "Location",
    entityId: location.id,
  });

  return NextResponse.json(location, { status: 201 });
}
