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

export function prepareBusinessFormPayload<T extends Record<string, unknown>>(
  data: T,
  options?: { compactImages?: boolean }
): T {
  const payload = { ...data } as T & {
    website?: string;
    socialLinks?: { platform: string; url: string }[];
    images?: { url: string; publicId?: string; type: string; alt?: string; sortOrder: number }[];
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

  if (options?.compactImages && Array.isArray(payload.images)) {
    // Only strip large base64 payloads — /api/uploads/ and https URLs are small.
    payload.images = payload.images.map((image) =>
      image.url?.startsWith("data:image/") && image.publicId
        ? { ...image, url: "" }
        : image
    );
  }

  return payload as T;
}
