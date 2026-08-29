import { NextResponse } from "next/server";
import { CampaignStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdminApi, recordAuditLog } from "@/lib/admin-utils";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;

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
      status: CampaignStatus.ACTIVE,
      rejectionReason: null,
    },
  });

  await recordAuditLog({
    userId: user!.id,
    action: "APPROVE_CAMPAIGN",
    entity: "AdvertisingCampaign",
    entityId: id,
    metadata: { businessId: campaign.businessId },
  });

  return NextResponse.json(updated);
}
