import { LeadSource } from "@prisma/client";
import { db } from "@/lib/db";
import { buildLgbEmailAddress, LGB_EMAIL_DOMAIN } from "@/lib/validations/lgb-email";

export function normalizeLgbEmailAddress(input: string): string {
  return buildLgbEmailAddress(input).toLowerCase();
}

export async function isLgbEmailAddressTaken(address: string): Promise<boolean> {
  const normalized = address.toLowerCase();

  const [userMatch, businessMatch, leads] = await Promise.all([
    db.user.findFirst({
      where: { lgbEmail: normalized },
      select: { id: true },
    }),
    db.business.findFirst({
      where: { lgbEmail: normalized },
      select: { id: true },
    }),
    db.lead.findMany({
      where: { source: LeadSource.LGB_EMAIL },
      select: { metadata: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  ]);

  if (userMatch || businessMatch) {
    return true;
  }

  return leads.some((lead) => {
    if (!lead.metadata || typeof lead.metadata !== "object") return false;
    const meta = lead.metadata as Record<string, unknown>;
    const requested =
      typeof meta.requestedAddress === "string"
        ? meta.requestedAddress.toLowerCase()
        : "";
    const backup =
      typeof meta.backupAddress === "string" ? meta.backupAddress.toLowerCase() : "";
    return requested === normalized || backup === normalized;
  });
}

export async function checkLgbEmailLocalPart(localPart: string) {
  const address = normalizeLgbEmailAddress(localPart);
  if (!address.endsWith(`@${LGB_EMAIL_DOMAIN}`)) {
    return { available: false, address, error: "Invalid email address" };
  }

  const taken = await isLgbEmailAddressTaken(address);
  return { available: !taken, address };
}
