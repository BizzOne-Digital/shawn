import { NextResponse } from "next/server";
import { z } from "zod";
import { NewsletterBroadcastStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdminApi, recordAuditLog } from "@/lib/admin-utils";
import {
  dedupeNewsletterRecipients,
  getNewsletterAudienceLeads,
} from "@/lib/newsletter-audience";
import { getNewsletterAdminData } from "@/lib/newsletter-admin-data";
import { sendNewsletterEmail } from "@/lib/services/newsletter-email";

function getPublicSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    process.env.AUTH_URL?.replace(/\/$/, "") ??
    "https://lets-go-buffalo.vercel.app"
  );
}

const sendSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200),
  body: z.string().min(1, "Message is required").max(50000),
  confirmSend: z.literal(true, {
    errorMap: () => ({ message: "Confirm send is required" }),
  }),
});

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  return NextResponse.json(await getNewsletterAdminData());
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  const parsed = sendSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const leads = await dedupeNewsletterRecipients(await getNewsletterAudienceLeads());
  if (leads.length === 0) {
    return NextResponse.json(
      {
        error:
          "No newsletter recipients. Subscribers need status Contacted or Converted in Admin → Leads (Newsletter filter).",
      },
      { status: 400 }
    );
  }

  const siteUrl = getPublicSiteUrl();
  let sent = 0;
  let failed = 0;

  for (const lead of leads) {
    try {
      await sendNewsletterEmail({
        to: lead.email,
        subject: parsed.data.subject,
        body: parsed.data.body,
        siteUrl,
      });
      sent += 1;
    } catch (error) {
      failed += 1;
      console.error("[newsletter send] failed for", lead.email, error);
    }
  }

  const status =
    failed === 0
      ? NewsletterBroadcastStatus.SENT
      : sent === 0
        ? NewsletterBroadcastStatus.FAILED
        : NewsletterBroadcastStatus.PARTIAL;

  const broadcast = await db.newsletterBroadcast.create({
    data: {
      subject: parsed.data.subject,
      bodyHtml: parsed.data.body,
      bodyText: parsed.data.body,
      sentByUserId: auth.user!.id,
      recipientCount: sent,
      failedCount: failed,
      status,
      sentAt: new Date(),
    },
  });

  await recordAuditLog({
    userId: auth.user!.id,
    action: "SEND_NEWSLETTER",
    entity: "NewsletterBroadcast",
    entityId: broadcast.id,
    metadata: { subject: parsed.data.subject, sent, failed },
  });

  return NextResponse.json({
    success: true,
    sent,
    failed,
    totalAttempted: leads.length,
    broadcastId: broadcast.id,
  });
}
