import { BusinessListingTier } from "@prisma/client";
import { db } from "@/lib/db";
import {
  generateUniqueSlug,
  syncBusinessRelations,
} from "@/lib/business-utils";
import {
  businessSubmissionSchema,
  freeBusinessSubmissionSchema,
  type BusinessSubmissionForm,
  type FreeBusinessSubmissionForm,
} from "@/lib/validations/business";
import { isProListingTier } from "@/lib/services/listing-tier";
import { sendListingStatusEmail } from "@/lib/services/email";
import { NOT_DELETED } from "@/lib/prisma-mongo-filters";

const SUBMITTABLE_STATUSES = ["DRAFT", "CHANGES_REQUESTED", "PUBLISHED"] as const;

const businessInclude = {
  category: true,
  subcategory: true,
  hours: true,
  images: true,
  socialLinks: true,
} as const;

function buildFreeBusinessData(data: FreeBusinessSubmissionForm) {
  return {
    name: data.name,
    phone: data.phone,
    website: data.website || null,
    categoryId: data.categoryId || null,
    subcategoryId: data.subcategoryId || null,
    suggestedCategory: data.suggestedCategory || null,
    address: data.address,
    city: data.city,
    state: data.state,
    zipCode: data.zipCode,
    locationId: data.locationId || null,
  };
}

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
    couponText: data.couponText || null,
    discountCode: data.discountCode || null,
    lgbEmail: data.lgbEmail ? `${data.lgbEmail.replace(/@.*/, "")}@LetsGoBuffalo.com` : null,
    videoUrl: data.videoUrl || null,
    searchKeywords: data.searchKeywords ?? [],
  };
}

function parseSubmissionData(rawData: unknown, tier: BusinessListingTier) {
  const schema = isProListingTier(tier) ? businessSubmissionSchema : freeBusinessSubmissionSchema;
  const result = schema.safeParse(rawData);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}

function toSubmissionPayload(
  business: NonNullable<Awaited<ReturnType<typeof loadOwnedBusiness>>>
) {
  return {
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
    couponText: business.couponText ?? undefined,
    discountCode: business.discountCode ?? undefined,
    lgbEmail: business.lgbEmail?.replace(/@LetsGoBuffalo\.com$/i, "") ?? undefined,
    videoUrl: business.videoUrl ?? undefined,
    searchKeywords: business.searchKeywords ?? [],
  };
}

async function loadOwnedBusiness(userId: string, businessId: string) {
  const query = () =>
    db.business.findFirst({
      where: { id: businessId, ownerId: userId, ...NOT_DELETED },
      include: businessInclude,
    });

  const business = await query();
  if (business) return business;

  // Brief retry — Atlas can lag immediately after a draft save in the same session.
  await new Promise((resolve) => setTimeout(resolve, 150));
  return query();
}

export function hasBusinessFormPayload(data: Record<string, unknown>): boolean {
  return Object.values(data).some((value) => {
    if (value === undefined || value === null) return false;
    if (typeof value === "string" && value.trim() === "") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });
}

export async function submitOwnedBusiness(userId: string, businessId: string) {
  const normalizedId = businessId.trim();
  const business = await loadOwnedBusiness(userId, normalizedId);

  if (!business) {
    throw new Error("Business not found");
  }

  const payload = toSubmissionPayload(business);
  parseSubmissionData(payload, business.listingTier);

  if (!SUBMITTABLE_STATUSES.includes(business.status as (typeof SUBMITTABLE_STATUSES)[number])) {
    throw new Error("Business cannot be submitted in its current status");
  }

  const wasPublished = business.status === "PUBLISHED";

  const submitted = await db.business.update({
    where: { id: normalizedId },
    data: {
      status: "PENDING_REVIEW",
      requiresReReview: wasPublished,
      adminFeedback: wasPublished ? null : business.adminFeedback,
    },
  });

  await db.listingSubmission.create({
    data: { businessId: normalizedId, status: "PENDING_REVIEW" },
  });

  await db.moderationAction.create({
    data: {
      businessId: normalizedId,
      action: "SUBMIT",
      message: "Business submitted for review by owner",
    },
  });

  const owner = await db.user.findUnique({ where: { id: userId } });
  if (owner?.email) {
    try {
      await sendListingStatusEmail(
        owner.email,
        submitted.name,
        wasPublished ? "Update Pending Review" : "Pending Review",
        wasPublished
          ? "Your listing updates have been submitted and are awaiting admin review. Your listing is temporarily hidden until approved."
          : "Your listing has been submitted and is awaiting admin review."
      );
    } catch (emailError) {
      console.error("[submitOwnedBusiness] Failed to send status email:", emailError);
    }
  }

  return submitted;
}

export async function saveAndSubmitBusiness(
  userId: string,
  businessId: string | undefined,
  rawData: unknown
) {
  const normalizedId = businessId?.trim() || undefined;

  const existing = normalizedId
    ? await db.business.findFirst({
        where: { id: normalizedId, ownerId: userId, ...NOT_DELETED },
      })
    : null;

  const tier = existing?.listingTier ?? BusinessListingTier.FREE_BASIC;
  const isPro = isProListingTier(tier);
  const data = parseSubmissionData(rawData, tier);

  let businessIdToUse: string;

  if (existing) {
    const slug =
      data.name !== existing.name
        ? await generateUniqueSlug(data.name, existing.id)
        : existing.slug;

    const updated = await db.business.update({
      where: { id: existing.id },
      data: {
        ...(isPro
          ? buildBusinessData(data as BusinessSubmissionForm)
          : buildFreeBusinessData(data as FreeBusinessSubmissionForm)),
        slug,
      },
    });
    businessIdToUse = updated.id;
  } else {
    const slug = await generateUniqueSlug(data.name);
    const created = await db.business.create({
      data: {
        ...(isPro
          ? buildBusinessData(data as BusinessSubmissionForm)
          : buildFreeBusinessData(data as FreeBusinessSubmissionForm)),
        slug,
        ownerId: userId,
        status: "DRAFT",
        listingTier: tier,
      },
    });
    businessIdToUse = created.id;
  }

  if (isPro) {
    await syncBusinessRelations(businessIdToUse, data as BusinessSubmissionForm);
  }

  return submitOwnedBusiness(userId, businessIdToUse);
}
