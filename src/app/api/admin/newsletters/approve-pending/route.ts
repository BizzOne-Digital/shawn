import { NextResponse } from "next/server";
import { LeadSource, LeadStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdminApi, recordAuditLog } from "@/lib/admin-utils";

export async function POST() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  const result = await db.lead.updateMany({
    where: {
      source: LeadSource.NEWSLETTER,
      consent: true,
      status: LeadStatus.NEW,
    },
    data: { status: LeadStatus.CONTACTED },
  });

  await recordAuditLog({
    userId: auth.user!.id,
    action: "APPROVE_NEWSLETTER_LEADS",
    entity: "Lead",
    metadata: { updated: result.count },
  });

  return NextResponse.json({ updated: result.count });
}
