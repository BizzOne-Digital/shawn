"use server";

import { db } from "@/lib/db";
import { LeadSource } from "@prisma/client";
import { lgbEmailRequestSchema } from "@/lib/validations/lgb-email";
import {
  isLgbEmailAddressTaken,
  normalizeLgbEmailAddress,
} from "@/lib/services/lgb-email-availability";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const enquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  businessId: z.string(),
});

const communityCommentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(5, "Comment must be at least 5 characters"),
});

const gearInquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  product: z.string().min(1, "Product is required"),
  message: z.string().optional(),
});

export async function submitContactForm(formData: FormData) {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid form data" };
  }

  try {
    await db.lead.create({
      data: {
        ...parsed.data,
        source: LeadSource.CONTACT_PAGE,
        consent: true,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("submitContactForm failed:", error);
    return { success: false, error: "Unable to send message right now. Please try again later." };
  }
}

export async function submitNewsletterForm(formData: FormData) {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid email" };
  }

  try {
    await db.lead.create({
      data: {
        name: "Newsletter Subscriber",
        email: parsed.data.email,
        message: "Newsletter signup",
        source: LeadSource.NEWSLETTER,
        consent: true,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("submitNewsletterForm failed:", error);
    return { success: false, error: "Unable to subscribe right now. Please try again later." };
  }
}

export async function submitBusinessEnquiry(formData: FormData) {
  const parsed = enquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    message: formData.get("message"),
    businessId: formData.get("businessId"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid form data" };
  }

  try {
    await db.lead.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        message: parsed.data.message,
        businessId: parsed.data.businessId,
        source: LeadSource.BUSINESS_ENQUIRY,
        consent: true,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("submitBusinessEnquiry failed:", error);
    return { success: false, error: "Unable to send enquiry right now." };
  }
}

export async function submitCommunityComment(formData: FormData) {
  const parsed = communityCommentSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid comment" };
  }

  try {
    await db.lead.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        message: `[Community Fan Page] ${parsed.data.message}`,
        source: LeadSource.CONTACT_PAGE,
        consent: true,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("submitCommunityComment failed:", error);
    return { success: false, error: "Unable to post comment right now." };
  }
}

export async function submitLgbEmailRequest(formData: FormData) {
  const parsed = lgbEmailRequestSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    requestedAddress: formData.get("requestedLocalPart"),
    backupAddress: formData.get("backupLocalPart"),
    forwardTo: formData.get("forwardTo"),
    businessName: formData.get("businessName") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid request" };
  }

  const requestedAddress = normalizeLgbEmailAddress(parsed.data.requestedAddress);
  const backupAddress = normalizeLgbEmailAddress(parsed.data.backupAddress);

  const [primaryTaken, backupTaken] = await Promise.all([
    isLgbEmailAddressTaken(requestedAddress),
    isLgbEmailAddressTaken(backupAddress),
  ]);

  if (primaryTaken && backupTaken) {
    return {
      success: false,
      error: "Both email choices are already taken. Please try different names.",
    };
  }

  try {
    await db.lead.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        message: `LGB Email request: ${requestedAddress} (backup: ${backupAddress}) → forward to ${parsed.data.forwardTo}`,
        source: LeadSource.LGB_EMAIL,
        consent: true,
        metadata: {
          requestedAddress,
          backupAddress,
          forwardTo: parsed.data.forwardTo,
          businessName: parsed.data.businessName ?? null,
          primaryAvailable: !primaryTaken,
          backupAvailable: !backupTaken,
        },
      },
    });

    const { sendLgbEmailNotification } = await import("@/lib/services/email");
    await sendLgbEmailNotification({
      ...parsed.data,
      requestedAddress,
      backupAddress,
    });

    return { success: true };
  } catch (error) {
    console.error("submitLgbEmailRequest failed:", error);
    return { success: false, error: "Unable to submit request right now." };
  }
}

export async function submitGearInquiry(formData: FormData) {
  const parsed = gearInquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    product: formData.get("product"),
    message: formData.get("message") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid form" };
  }

  try {
    await db.lead.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        message: `[Gear Order Inquiry: ${parsed.data.product}] ${parsed.data.message ?? ""}`.trim(),
        source: LeadSource.CONTACT_PAGE,
        consent: true,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("submitGearInquiry failed:", error);
    return { success: false, error: "Unable to submit order inquiry right now." };
  }
}
