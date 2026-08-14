"use server";

import { db } from "@/lib/db";
import { LeadSource } from "@prisma/client";
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

  await db.lead.create({
    data: {
      ...parsed.data,
      source: LeadSource.CONTACT_PAGE,
      consent: true,
    },
  });

  return { success: true };
}

export async function submitNewsletterForm(formData: FormData) {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid email" };
  }

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
}
