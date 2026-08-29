import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  requireSessionUser,
  requireOwnedBusiness,
  handleApiError,
} from "@/lib/api-utils";
import { businessSubmissionSchema } from "@/lib/validations/business";
import { sendListingStatusEmail } from "@/lib/services/email";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await requireSessionUser();
    if ("error" in result) return result.error;

    const owned = await requireOwnedBusiness(id, result.user.id);
    if ("error" in owned) return owned.error;

    if (!["DRAFT", "CHANGES_REQUESTED", "PUBLISHED"].includes(owned.business.status)) {
      return NextResponse.json(
        { error: "Business cannot be submitted in its current status" },
        { status: 400 }
      );
    }

    businessSubmissionSchema.parse({
      name: owned.business.name,
      phone: owned.business.phone,
      publicEmail: owned.business.publicEmail ?? "",
      website: owned.business.website ?? "",
      categoryId: owned.business.categoryId,
      subcategoryId: owned.business.subcategoryId ?? undefined,
      suggestedCategory: owned.business.suggestedCategory ?? undefined,
      shortDescription: owned.business.shortDescription,
      description: owned.business.description,
      services: owned.business.services,
      tags: owned.business.tags,
      address: owned.business.address,
      addressLine2: owned.business.addressLine2 ?? undefined,
      city: owned.business.city,
      state: owned.business.state,
      zipCode: owned.business.zipCode,
      locationId: owned.business.locationId ?? undefined,
      socialLinks: owned.business.socialLinks.map((s) => ({
        platform: s.platform,
        url: s.url,
      })),
      hours: owned.business.hours,
      images: owned.business.images.map((img) => ({
        url: img.url,
        publicId: img.publicId ?? undefined,
        type: img.type,
        alt: img.alt ?? undefined,
        sortOrder: img.sortOrder,
      })),
    });

    const wasPublished = owned.business.status === "PUBLISHED";

    const business = await db.business.update({
      where: { id },
      data: {
        status: "PENDING_REVIEW",
        requiresReReview: wasPublished,
        adminFeedback: wasPublished ? null : owned.business.adminFeedback,
      },
    });

    await db.listingSubmission.create({
      data: { businessId: id, status: "PENDING_REVIEW" },
    });

    await db.moderationAction.create({
      data: {
        businessId: id,
        action: "SUBMIT",
        message: "Business submitted for review by owner",
      },
    });

    const owner = await db.user.findUnique({ where: { id: result.user.id } });
    if (owner?.email) {
      await sendListingStatusEmail(
        owner.email,
        business.name,
        wasPublished ? "Update Pending Review" : "Pending Review",
        wasPublished
          ? "Your listing updates have been submitted and are awaiting admin review. Your listing is temporarily hidden until approved."
          : "Your listing has been submitted and is awaiting admin review."
      );
    }

    return NextResponse.json(business);
  } catch (error) {
    return handleApiError(error);
  }
}
