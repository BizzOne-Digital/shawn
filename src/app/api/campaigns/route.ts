import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  requireSessionUser,
  handleApiError,
} from "@/lib/api-utils";
import { campaignSchema } from "@/lib/validations/business";
import { NOT_DELETED } from "@/lib/prisma-mongo-filters";

export async function GET() {
  const result = await requireSessionUser();
  if ("error" in result) return result.error;

  const campaigns = await db.advertisingCampaign.findMany({
    where: { ownerId: result.user.id },
    include: {
      business: { select: { id: true, name: true, slug: true } },
      targets: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(campaigns);
}

export async function POST(request: Request) {
  try {
    const result = await requireSessionUser();
    if ("error" in result) return result.error;

    const body = await request.json();
    const data = campaignSchema.parse(body);

    const business = await db.business.findFirst({
      where: {
        id: data.businessId,
        ownerId: result.user.id,
        ...NOT_DELETED,
        status: { in: ["APPROVED", "PUBLISHED"] },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found or not eligible for advertising" },
        { status: 400 }
      );
    }

    const wallet = await db.wallet.findUnique({
      where: { userId: result.user.id },
    });

    if (!wallet || Number(wallet.balance) < Number(data.dailyBid)) {
      return NextResponse.json(
        { error: "Insufficient wallet balance. Please add funds first." },
        { status: 400 }
      );
    }

    const categories = await db.category.findMany({
      where: { id: { in: data.categoryIds }, isActive: true },
      select: { id: true },
    });

    if (categories.length !== data.categoryIds.length) {
      return NextResponse.json(
        { error: "One or more selected categories are invalid" },
        { status: 400 }
      );
    }

    const campaign = await db.advertisingCampaign.create({
      data: {
        name: data.name,
        businessId: data.businessId,
        ownerId: result.user.id,
        dailyBid: data.dailyBid,
        totalBudget: data.totalBudget,
        startDate: data.startDate,
        endDate: data.endDate,
        status: "PENDING_APPROVAL",
        targets: {
          create: data.categoryIds.map((categoryId) => ({
            targetType: "CATEGORY",
            value: categoryId,
          })),
        },
        bids: {
          create: { amount: data.dailyBid },
        },
      },
      include: {
        business: { select: { id: true, name: true } },
        targets: true,
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
