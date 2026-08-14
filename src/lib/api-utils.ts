import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user };
}

export async function getOwnedBusiness(businessId: string, userId: string) {
  return db.business.findFirst({
    where: { id: businessId, ownerId: userId, deletedAt: null },
    include: {
      category: true,
      subcategory: true,
      location: true,
      hours: true,
      images: { orderBy: { sortOrder: "asc" } },
      socialLinks: true,
      submissions: { orderBy: { submittedAt: "desc" } },
      moderationActions: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function requireOwnedBusiness(businessId: string, userId: string) {
  const business = await getOwnedBusiness(businessId, userId);
  if (!business) {
    return { error: NextResponse.json({ error: "Business not found" }, { status: 404 }) };
  }
  return { business };
}

export async function getOwnedCampaign(campaignId: string, userId: string) {
  return db.advertisingCampaign.findFirst({
    where: { id: campaignId, ownerId: userId },
    include: {
      business: { select: { id: true, name: true, slug: true } },
      targets: true,
    },
  });
}

export function handleApiError(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: error.errors[0]?.message ?? "Validation error" },
      { status: 400 }
    );
  }
  console.error("[API Error]", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
