import { z } from "zod";
import { DayOfWeek, ImageType, SocialPlatform } from "@prisma/client";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const basicInfoSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters").max(120),
  phone: z.string().min(10, "Phone number is required").max(20),
  publicEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export const categorySchema = z.object({
  categoryId: z.string().min(1, "Please select a category"),
  subcategoryId: z.string().optional(),
  suggestedCategory: z.string().max(100).optional(),
});

export const descriptionSchema = z.object({
  shortDescription: z
    .string()
    .min(10, "Short description must be at least 10 characters")
    .max(200),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(5000),
  services: z.array(z.string().min(1)),
  tags: z.array(z.string().min(1)).max(10),
});

export const locationSchema = z.object({
  address: z.string().min(5, "Address is required").max(200),
  addressLine2: z.string().max(100).optional(),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().default("NY"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  locationId: z.string().optional(),
});

export const socialLinkSchema = z.object({
  platform: z.nativeEnum(SocialPlatform),
  url: z.string().url("Invalid URL"),
});

export const socialSchema = z.object({
  socialLinks: z.array(socialLinkSchema),
});

export const businessHourSchema = z
  .object({
    dayOfWeek: z.nativeEnum(DayOfWeek),
    openTime: z.string().regex(timeRegex).nullable(),
    closeTime: z.string().regex(timeRegex).nullable(),
    isClosed: z.boolean(),
    is24Hours: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.isClosed || data.is24Hours) return true;
      return !!(data.openTime && data.closeTime);
    },
    { message: "Open and close times are required when not closed" }
  );

export const hoursSchema = z.object({
  hours: z.array(businessHourSchema).length(7),
});

export const businessImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  type: z.nativeEnum(ImageType),
  alt: z.string().max(200).optional(),
  sortOrder: z.number().int(),
});

export const imagesSchema = z.object({
  images: z.array(businessImageSchema).min(1, "At least one image is required"),
});

export const businessSubmissionSchema = basicInfoSchema
  .merge(categorySchema)
  .merge(descriptionSchema)
  .merge(locationSchema)
  .merge(socialSchema)
  .merge(hoursSchema)
  .merge(imagesSchema);

export type BasicInfoForm = z.infer<typeof basicInfoSchema>;
export type CategoryForm = z.infer<typeof categorySchema>;
export type DescriptionForm = z.infer<typeof descriptionSchema>;
export type LocationForm = z.infer<typeof locationSchema>;
export type SocialForm = z.infer<typeof socialSchema>;
export type HoursForm = z.infer<typeof hoursSchema>;
export type ImagesForm = z.infer<typeof imagesSchema>;
export type BusinessSubmissionForm = z.infer<typeof businessSubmissionSchema>;

export const STEP_SCHEMAS = [
  basicInfoSchema,
  categorySchema,
  descriptionSchema,
  locationSchema,
  socialSchema,
  hoursSchema,
  imagesSchema,
  businessSubmissionSchema,
  z.object({}),
] as const;

export const STEP_LABELS = [
  "Basic Info",
  "Category",
  "Description",
  "Location",
  "Social Media",
  "Hours",
  "Images",
  "Preview",
  "Submit",
] as const;

export const campaignSchema = z.object({
  name: z.string().min(3).max(100),
  businessId: z.string().min(1),
  dailyBid: z.coerce.number().min(1).max(1000),
  totalBudget: z.coerce.number().min(10).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  targetType: z.enum(["ALL", "KEYWORD", "CATEGORY", "LOCATION"]),
  targetValue: z.string().optional(),
});

export const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10).max(2000),
  businessId: z.string().optional(),
  source: z.enum(["CONTACT_PAGE", "BUSINESS_PROFILE", "BUSINESS_ENQUIRY", "NEWSLETTER"]),
  consent: z.literal(true, { errorMap: () => ({ message: "Consent is required" }) }),
});
