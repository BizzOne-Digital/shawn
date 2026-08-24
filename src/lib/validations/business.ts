import { z } from "zod";
import { DayOfWeek, ImageType, SocialPlatform } from "@prisma/client";
import { normalizeSocialUrl, normalizeWebsiteUrl } from "@/lib/url-utils";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const emptyToUndefined = (value: unknown) =>
  value === "" || value === null || value === undefined ? undefined : value;

const optionalWebsiteField = z.preprocess(
  (val) => {
    if (typeof val !== "string" || !val.trim()) return "";
    return normalizeWebsiteUrl(val);
  },
  z.union([z.literal(""), z.string().url("Enter a valid website (e.g. yourbusiness.com)")])
);

const optionalSocialUrlField = z.preprocess(
  (val) => {
    if (typeof val !== "string" || !val.trim()) return "";
    return normalizeSocialUrl(val);
  },
  z.union([z.literal(""), z.string().url("Enter a valid URL")])
);

export const basicInfoSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters").max(120),
  phone: z.string().min(10, "Phone number is required").max(20),
  publicEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  website: optionalWebsiteField.optional(),
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
  url: z.preprocess(
    (val) => {
      if (typeof val !== "string" || !val.trim()) return "";
      return normalizeSocialUrl(val);
    },
    z.string().url("Enter a valid social profile URL")
  ),
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
  url: z
    .string()
    .min(1, "Image URL is required")
    .refine(
      (value) =>
        value.startsWith("https://") ||
        value.startsWith("http://") ||
        value.startsWith("data:image/"),
      { message: "Invalid image URL" }
    ),
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

/** Lenient schema for autosave / draft — does not require all steps to be complete */
export const businessDraftSchema = z.object({
  name: z.preprocess(emptyToUndefined, z.string().min(2).optional()),
  phone: z.preprocess(emptyToUndefined, z.string().optional()),
  publicEmail: z.union([z.literal(""), z.string().email()]).optional(),
  website: optionalWebsiteField.optional(),
  categoryId: z.preprocess(emptyToUndefined, z.string().optional()),
  subcategoryId: z.preprocess(emptyToUndefined, z.string().optional()),
  suggestedCategory: z.preprocess(emptyToUndefined, z.string().optional()),
  shortDescription: z.preprocess(emptyToUndefined, z.string().optional()),
  description: z.preprocess(emptyToUndefined, z.string().optional()),
  services: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  address: z.preprocess(emptyToUndefined, z.string().optional()),
  addressLine2: z.preprocess(emptyToUndefined, z.string().optional()),
  city: z.preprocess(emptyToUndefined, z.string().optional()),
  state: z.string().optional(),
  zipCode: z.preprocess(emptyToUndefined, z.string().optional()),
  locationId: z.preprocess(emptyToUndefined, z.string().optional()),
  socialLinks: z
    .array(
      z.object({
        platform: z.nativeEnum(SocialPlatform),
        url: optionalSocialUrlField,
      })
    )
    .optional(),
  hours: z.array(businessHourSchema).optional(),
  images: z.array(businessImageSchema).optional(),
});

export type BusinessDraftForm = z.infer<typeof businessDraftSchema>;

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
  categoryIds: z
    .array(z.string().min(1))
    .min(1, "Select at least one category to bid on"),
  dailyBid: z.coerce
    .number()
    .min(0.25, "Minimum bid is $0.25 per day")
    .max(1000),
  totalBudget: z.coerce.number().min(0.25).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
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
