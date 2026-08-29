export const IMAGE_PLACEHOLDER = "/images/logo.png";

/** Resolve a stored image URL, falling back for missing or legacy disk paths. */
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url?.trim()) return IMAGE_PLACEHOLDER;
  if (url.startsWith("/uploads/")) return IMAGE_PLACEHOLDER;
  return url;
}

export function isLegacyDiskUploadUrl(url: string | null | undefined): boolean {
  return Boolean(url?.startsWith("/uploads/"));
}
