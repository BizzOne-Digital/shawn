export function normalizeWebsiteUrl(value: string | undefined | null): string {
  if (!value?.trim()) return "";
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function normalizeSocialUrl(value: string | undefined | null): string {
  if (!value?.trim()) return "";
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function prepareBusinessFormPayload<T extends Record<string, unknown>>(data: T): T {
  const payload = { ...data } as T & {
    website?: string;
    socialLinks?: { platform: string; url: string }[];
  };

  if (typeof payload.website === "string") {
    payload.website = payload.website.trim()
      ? normalizeWebsiteUrl(payload.website)
      : "";
  }

  if (Array.isArray(payload.socialLinks)) {
    payload.socialLinks = payload.socialLinks
      .map((link) => ({
        ...link,
        url: link.url?.trim() ? normalizeSocialUrl(link.url) : "",
      }))
      .filter((link) => link.url);
  }

  return payload as T;
}
