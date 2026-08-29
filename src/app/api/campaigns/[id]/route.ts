import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  requireSessionUser,
  getOwnedCampaign,
  handleApiError,
} from "@/lib/api-utils";
import { z } from "zod";
import { getMinimumDailyBid } from "@/lib/services/ad-settings";

const updateSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  dailyBid: z.coerce.number().min(0.01).max(1000).optional(),
  totalBudget: z.coerce.number().min(10).optional(),
  endDate: z.coerce.date().optional(),
  status: z.enum(["PAUSED", "ACTIVE"]).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await requireSessionUser();
  if ("error" in result) return result.error;

  const campaign = await getOwnedCampaign(id, result.user.id);
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  return NextResponse.json(campaign);
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await requireSessionUser();
    if ("error" in result) return result.error;

    const campaign = await getOwnedCampaign(id, result.user.id);
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    const minimumDailyBid = await getMinimumDailyBid();
    if (data.dailyBid !== undefined && Number(data.dailyBid) < minimumDailyBid) {
      return NextResponse.json(
        { error: `Minimum bid is $${minimumDailyBid.toFixed(2)} per day` },
        { status: 400 }
      );
    }

    if (data.dailyBid !== undefined) {
      const wallet = await db.wallet.findUnique({
        where: { userId: result.user.id },
      });
      if (!wallet || Number(wallet.balance) < Number(data.dailyBid)) {
        return NextResponse.json(
          { error: "Insufficient wallet balance for this bid amount." },
          { status: 400 }
        );
      }
    }

    if (data.status === "ACTIVE" && campaign.status !== "ACTIVE" && campaign.status !== "PAUSED") {
      return NextResponse.json(
        { error: "Campaign cannot be activated in its current status" },
        { status: 400 }
      );
    }

    const updated = await db.advertisingCampaign.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.dailyBid !== undefined && { dailyBid: data.dailyBid }),
        ...(data.totalBudget !== undefined && { totalBudget: data.totalBudget }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.status && { status: data.status }),
      },
      include: {
        business: { select: { id: true, name: true } },
        targets: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
