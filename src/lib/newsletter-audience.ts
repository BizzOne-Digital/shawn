import { LeadSource, LeadStatus } from "@prisma/client";
import { db } from "@/lib/db";

/** Newsletter emails go only to these lead statuses (both start with “C”). */
export const NEWSLETTER_SEND_STATUSES: LeadStatus[] = [
  LeadStatus.CONTACTED,
  LeadStatus.CONVERTED,
];

export function newsletterStatusLabel(status: LeadStatus): string {
  return status.replace(/_/g, " ");
}

export async function getNewsletterAudienceLeads() {
  return db.lead.findMany({
    where: {
      source: LeadSource.NEWSLETTER,
      consent: true,
      status: { in: NEWSLETTER_SEND_STATUSES },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function dedupeNewsletterRecipients(
  leads: Awaited<ReturnType<typeof getNewsletterAudienceLeads>>
) {
  const byEmail = new Map<string, (typeof leads)[number]>();
  for (const lead of leads) {
    const key = lead.email.trim().toLowerCase();
    if (!key) continue;
    if (!byEmail.has(key)) byEmail.set(key, lead);
  }
  return [...byEmail.values()];
}

export async function getNewsletterAudienceStats() {
  const [eligibleLeads, pendingNew] = await Promise.all([
    getNewsletterAudienceLeads(),
    db.lead.count({
      where: {
        source: LeadSource.NEWSLETTER,
        consent: true,
        status: LeadStatus.NEW,
      },
    }),
  ]);

  const recipients = await dedupeNewsletterRecipients(eligibleLeads);

  return {
    eligibleCount: recipients.length,
    pendingNewCount: pendingNew,
    sendStatuses: NEWSLETTER_SEND_STATUSES,
  };
}
