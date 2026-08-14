import { z } from "zod";
import { ListingStatus } from "@prisma/client";

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
});
