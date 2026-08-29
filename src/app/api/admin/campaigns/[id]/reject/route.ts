import { NextResponse } from "next/server";
import { CampaignStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi, recordAuditLog } from "@/lib/admin-utils";

const schema = z.object({
  reason: z.string().min(1, "Rejection reason is required"),
});

export async function POST(
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

  const campaign = await db.advertisingCampaign.findUnique({ where: { id } });
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (campaign.status !== CampaignStatus.PENDING_APPROVAL) {
    return NextResponse.json({ error: "Campaign is not pending approval" }, { status: 400 });
  }

  const updated = await db.advertisingCampaign.update({
    where: { id },
    data: {
      status: CampaignStatus.REJECTED,
      rejectionReason: parsed.data.reason,
    },
  });

  await recordAuditLog({
    userId: user!.id,
    action: "REJECT_CAMPAIGN",
    entity: "AdvertisingCampaign",
    entityId: id,
    metadata: { reason: parsed.data.reason, businessId: campaign.businessId },
  });

  return NextResponse.json(updated);
}
