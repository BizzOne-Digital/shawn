import { db } from "@/lib/db";
import {
  generateUniqueSlug,
  syncBusinessRelations,
} from "@/lib/business-utils";
import {
  businessSubmissionSchema,
  type BusinessSubmissionForm,
} from "@/lib/validations/business";
import { sendListingStatusEmail } from "@/lib/services/email";

function buildBusinessData(data: BusinessSubmissionForm) {
  return {
    name: data.name,
    phone: data.phone,
    publicEmail: data.publicEmail || null,
    website: data.website || null,
    categoryId: data.categoryId || null,
    subcategoryId: data.subcategoryId || null,
    suggestedCategory: data.suggestedCategory || null,
    shortDescription: data.shortDescription,
    description: data.description,
    services: data.services,
    tags: data.tags,
    address: data.address,
    addressLine2: data.addressLine2 || null,
    city: data.city,
    state: data.state,
    zipCode: data.zipCode,
    locationId: data.locationId || null,
  };
}

export async function saveAndSubmitBusiness(
  userId: string,
  businessId: string | undefined,
  rawData: unknown
) {
  const data = businessSubmissionSchema.parse(rawData);
  const normalizedId = businessId?.trim() || undefined;

  let existing =
    normalizedId &&
    (await db.business.findFirst({
      where: { id: normalizedId, ownerId: userId, deletedAt: null },
    }));

  let businessIdToUse: string;

  if (existing) {
    const slug =
      data.name !== existing.name
        ? await generateUniqueSlug(data.name, existing.id)
        : existing.slug;

    const updated = await db.business.update({
      where: { id: existing.id },
      data: {
        ...buildBusinessData(data),
        slug,
      },
    });
    businessIdToUse = updated.id;
  } else {
    const slug = await generateUniqueSlug(data.name);
    const created = await db.business.create({
      data: {
        ...buildBusinessData(data),
        slug,
        ownerId: userId,
        status: "DRAFT",
      },
    });
    businessIdToUse = created.id;
  }

  await syncBusinessRelations(businessIdToUse, data);

  const business = await db.business.findFirst({
    where: { id: businessIdToUse, ownerId: userId, deletedAt: null },
    include: {
      category: true,
      subcategory: true,
      hours: true,
      images: true,
      socialLinks: true,
    },
  });

  if (!business) {
    throw new Error("Failed to save business listing");
  }

  businessSubmissionSchema.parse({
    name: business.name,
    phone: business.phone,
    publicEmail: business.publicEmail ?? "",
    website: business.website ?? "",
    categoryId: business.categoryId,
    subcategoryId: business.subcategoryId ?? undefined,
    suggestedCategory: business.suggestedCategory ?? undefined,
    shortDescription: business.shortDescription,
    description: business.description,
    services: business.services,
    tags: business.tags,
    address: business.address,
    addressLine2: business.addressLine2 ?? undefined,
    city: business.city,
    state: business.state,
    zipCode: business.zipCode,
    locationId: business.locationId ?? undefined,
    socialLinks: business.socialLinks.map((s) => ({
      platform: s.platform,
      url: s.url,
    })),
    hours: business.hours,
    images: business.images.map((img) => ({
      url: img.url,
      publicId: img.publicId ?? undefined,
      type: img.type,
      alt: img.alt ?? undefined,
      sortOrder: img.sortOrder,
    })),
  });

  if (!["DRAFT", "CHANGES_REQUESTED", "PUBLISHED"].includes(business.status)) {
    throw new Error("Business cannot be submitted in its current status");
  }

  const wasPublished = business.status === "PUBLISHED";

  const submitted = await db.business.update({
    where: { id: businessIdToUse },
    data: {
      status: "PENDING_REVIEW",
      requiresReReview: wasPublished,
      adminFeedback: wasPublished ? null : business.adminFeedback,
    },
  });

  await db.listingSubmission.create({
    data: { businessId: businessIdToUse, status: "PENDING_REVIEW" },
  });

  await db.moderationAction.create({
    data: {
      businessId: businessIdToUse,
      action: "SUBMIT",
      message: "Business submitted for review by owner",
    },
  });

  const owner = await db.user.findUnique({ where: { id: userId } });
  if (owner?.email) {
    await sendListingStatusEmail(
      owner.email,
      submitted.name,
      wasPublished ? "Update Pending Review" : "Pending Review",
      wasPublished
        ? "Your listing updates have been submitted and are awaiting admin review. Your listing is temporarily hidden until approved."
        : "Your listing has been submitted and is awaiting admin review."
    );
  }

  return submitted;
}
