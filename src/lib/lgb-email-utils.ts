export const LGB_EMAIL_DOMAIN = "letsgobuffalo.com";
export const LGB_EMAIL_REQUEST_TO = "emailrequest@letsgobuffalo.com";
export const LGB_EMAIL_MIN_LOCAL_PART_LENGTH = 5;

export function normalizeLocalPart(value: string): string {
  return value.trim().toLowerCase().split("@")[0] ?? "";
}

export function buildLgbEmailAddress(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  if (trimmed.includes("@")) {
    const [localPart] = trimmed.split("@");
    return `${normalizeLocalPart(localPart)}@${LGB_EMAIL_DOMAIN}`;
  }

  return `${normalizeLocalPart(trimmed)}@${LGB_EMAIL_DOMAIN}`;
}
