import { LeadSource } from "@prisma/client";
import { db } from "@/lib/db";
import { buildLgbEmailAddress, LGB_EMAIL_DOMAIN, LGB_EMAIL_MIN_LOCAL_PART_LENGTH, normalizeLocalPart } from "@/lib/lgb-email-utils";
import { isReservedLgbEmailLocalPart } from "@/lib/services/lgb-email-reserved";

export { LGB_EMAIL_MIN_LOCAL_PART_LENGTH };

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
  const normalizedPart = normalizeLocalPart(localPart);
  const address = normalizeLgbEmailAddress(localPart);

  if (!normalizedPart || normalizedPart.length < LGB_EMAIL_MIN_LOCAL_PART_LENGTH) {
    return {
      available: false,
      address,
      reason: "too_short" as const,
      error: `Email name must be at least ${LGB_EMAIL_MIN_LOCAL_PART_LENGTH} characters`,
    };
  }

  if (!address.endsWith(`@${LGB_EMAIL_DOMAIN}`)) {
    return { available: false, address, reason: "invalid" as const, error: "Invalid email address" };
  }

  if (await isReservedLgbEmailLocalPart(normalizedPart)) {
    return { available: false, address, reason: "reserved" as const, error: "This address is not available" };
  }

  const taken = await isLgbEmailAddressTaken(address);
  return { available: !taken, address, reason: taken ? ("taken" as const) : undefined };
}
