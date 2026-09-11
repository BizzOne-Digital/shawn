import { db } from "@/lib/db";
import { normalizeLocalPart } from "@/lib/lgb-email-utils";

export const LGB_EMAIL_RESERVED_SETTING_KEY = "lgb_email_reserved_local_parts";

export const DEFAULT_RESERVED_LGB_EMAIL_LOCAL_PARTS = [
  "admin",
  "ez",
  "shawn",
  "info",
  "support",
  "postmaster",
  "root",
  "webmaster",
  "noreply",
  "mail",
  "contact",
  "help",
  "sales",
  "billing",
  "listings",
];

export async function getReservedLgbEmailLocalParts(): Promise<string[]> {
  const setting = await db.siteSetting.findUnique({
    where: { key: LGB_EMAIL_RESERVED_SETTING_KEY },
  });

  const stored = Array.isArray(setting?.value)
    ? (setting.value as unknown[])
        .filter((entry): entry is string => typeof entry === "string")
        .map(normalizeLocalPart)
        .filter(Boolean)
    : DEFAULT_RESERVED_LGB_EMAIL_LOCAL_PARTS;

  return [...new Set(stored.length > 0 ? stored : DEFAULT_RESERVED_LGB_EMAIL_LOCAL_PARTS)];
}

export async function isReservedLgbEmailLocalPart(localPart: string): Promise<boolean> {
  const normalized = normalizeLocalPart(localPart);
  if (!normalized) return true;
  const reserved = await getReservedLgbEmailLocalParts();
  return reserved.includes(normalized);
}

export async function saveReservedLgbEmailLocalParts(localParts: string[]): Promise<string[]> {
  const normalized = [
    ...new Set(localParts.map(normalizeLocalPart).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b));

  await db.siteSetting.upsert({
    where: { key: LGB_EMAIL_RESERVED_SETTING_KEY },
    create: { key: LGB_EMAIL_RESERVED_SETTING_KEY, value: normalized },
    update: { value: normalized },
  });

  return normalized;
}
