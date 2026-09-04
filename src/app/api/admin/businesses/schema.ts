import { z } from "zod";
import { ListingStatus, ImageType, BusinessListingTier } from "@prisma/client";

const adminBusinessImageSchema = z.object({
  url: z.string().min(1),
  publicId: z.string().optional(),
  type: z.nativeEnum(ImageType),
  alt: z.string().optional(),
  sortOrder: z.number().int(),
});

export const businessSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  status: z.nativeEnum(ListingStatus).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  publicEmail: z.string().optional(),
  website: z.string().optional(),
  isVerified: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  listingTier: z.nativeEnum(BusinessListingTier).optional(),
  images: z.array(adminBusinessImageSchema).optional(),
});
