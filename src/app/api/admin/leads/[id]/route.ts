import { NextResponse } from "next/server";
import { LeadStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi, recordAuditLog } from "@/lib/admin-utils";

const schema = z.object({
  status: z.nativeEnum(LeadStatus),
});

export async function PATCH(
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

  const lead = await db.lead.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  await recordAuditLog({
    userId: user!.id,
    action: "UPDATE_LEAD",
    entity: "Lead",
    entityId: id,
    metadata: parsed.data,
  });

  return NextResponse.json(lead);
}
