import slugify from "slugify";
import { db } from "@/lib/db";
import type { BusinessSubmissionForm } from "@/lib/validations/business";
import { Prisma, type ImageType } from "@prisma/client";

type SyncableBusinessRelations = Partial<Omit<BusinessSubmissionForm, "images">> & {
  images?: Array<{
    url?: string;
    publicId?: string;
    type: ImageType;
    alt?: string;
    sortOrder: number;
  }>;
};

export async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name, { lower: true, strict: true }) || "business";
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await db.business.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (!existing) return slug;
    slug = `${base}-${counter++}`;
  }
}

export function mapBusinessFormToData(
  data: Partial<BusinessSubmissionForm>,
  ownerId: string,
  slug: string
): Prisma.BusinessCreateInput {
  return {
    name: data.name ?? "Untitled Business",
    slug,
    owner: { connect: { id: ownerId } },
    status: "DRAFT",
    phone: data.phone,
    publicEmail: data.publicEmail || null,
    website: data.website || null,
    category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
    subcategory: data.subcategoryId ? { connect: { id: data.subcategoryId } } : undefined,
    suggestedCategory: data.suggestedCategory || null,
    shortDescription: data.shortDescription,
    description: data.description,
    services: data.services ?? [],
    tags: data.tags ?? [],
    address: data.address,
    addressLine2: data.addressLine2 || null,
    city: data.city,
    state: data.state ?? "NY",
    zipCode: data.zipCode,
    location: data.locationId ? { connect: { id: data.locationId } } : undefined,
  };
}

export async function syncBusinessRelations(
  businessId: string,
  data: SyncableBusinessRelations
) {
  if (data.hours) {
    await db.businessHour.deleteMany({ where: { businessId } });
    if (data.hours.length > 0) {
      await db.businessHour.createMany({
        data: data.hours.map((h) => ({ ...h, businessId })),
      });
    }
  }

  if (data.socialLinks) {
    await db.socialLink.deleteMany({ where: { businessId } });
    if (data.socialLinks.length > 0) {
      await db.socialLink.createMany({
        data: data.socialLinks.map((s) => ({
          businessId,
          platform: s.platform,
          url: s.url,
        })),
      });
    }
  }

  if (data.images) {
    const existingImages = await db.businessImage.findMany({ where: { businessId } });
    await db.businessImage.deleteMany({ where: { businessId } });
    if (data.images.length > 0) {
      await db.businessImage.createMany({
        data: data.images.map((img, i) => {
          const existing = existingImages.find(
            (entry) => entry.publicId && entry.publicId === img.publicId
          );
          const url = img.url?.trim() || existing?.url;
          if (!url) {
            throw new Error("Image URL is required");
          }

          return {
            businessId,
            url,
            publicId: img.publicId ?? existing?.publicId,
            type: img.type,
            alt: img.alt,
            sortOrder: img.sortOrder ?? i,
          };
        }),
      });
    }
  }
}

export function getListingStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "Draft",
    PENDING_REVIEW: "Pending Review",
    CHANGES_REQUESTED: "Changes Requested",
    APPROVED: "Approved",
    PUBLISHED: "Published",
    REJECTED: "Rejected",
    SUSPENDED: "Suspended",
    ARCHIVED: "Archived",
  };
  return labels[status] ?? status;
}
