import { db } from "@/lib/db";
import { getNewsletterAudienceStats } from "@/lib/newsletter-audience";

export async function getNewsletterAdminData() {
  const [stats, history] = await Promise.all([
    getNewsletterAudienceStats(),
    db.newsletterBroadcast.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return {
    audience: {
      eligibleCount: stats.eligibleCount,
      pendingNewCount: stats.pendingNewCount,
      sendStatusLabels: stats.sendStatuses.map((s) => s.replace(/_/g, " ")),
    },
    history: history.map((row) => ({
      id: row.id,
      subject: row.subject,
      recipientCount: row.recipientCount,
      failedCount: row.failedCount,
      status: row.status,
      sentAt: row.sentAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    })),
  };
}
