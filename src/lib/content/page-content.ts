import { db } from "@/lib/db";
import {
  CMS_PAGES,
  getCmsPage,
  getDefaultPageContent,
} from "@/lib/content/cms-config";
import type { PageContentMap } from "@/lib/content/content-text";

export type { PageContentMap };
export { txt } from "@/lib/content/content-text";

const CONTENT_KEY_PREFIX = "page_content:";

export function contentKey(slug: string) {
  return `${CONTENT_KEY_PREFIX}${slug}`;
}

export async function getPageContent(slug: string): Promise<PageContentMap> {
  const defaults = getDefaultPageContent(slug);
  try {
    const setting = await db.siteSetting.findUnique({
      where: { key: contentKey(slug) },
    });
    if (
      setting?.value &&
      typeof setting.value === "object" &&
      !Array.isArray(setting.value)
    ) {
      return { ...defaults, ...(setting.value as PageContentMap) };
    }
  } catch (error) {
    console.error(`Failed to load page content for ${slug}:`, error);
  }
  return defaults;
}

export function validatePageContent(
  slug: string,
  content: Record<string, unknown>
): PageContentMap | { error: string } {
  const page = getCmsPage(slug);
  if (!page) return { error: "Unknown page" };

  const allowedKeys = new Set(
    page.sections.flatMap((section) => section.fields.map((field) => field.key))
  );

  const sanitized: PageContentMap = {};
  for (const [key, value] of Object.entries(content)) {
    if (!allowedKeys.has(key)) continue;
    if (typeof value !== "string") continue;
    sanitized[key] = value;
  }

  return sanitized;
}

export async function savePageContent(
  slug: string,
  content: PageContentMap,
  userId: string
) {
  const page = getCmsPage(slug);
  if (!page) throw new Error("Unknown page");

  const existing = await getPageContent(slug);
  const merged = { ...existing, ...content };

  await db.siteSetting.upsert({
    where: { key: contentKey(slug) },
    create: { key: contentKey(slug), value: merged as never },
    update: { value: merged as never },
  });

  const { recordAuditLog } = await import("@/lib/admin-utils");
  await recordAuditLog({
    userId,
    action: "UPDATE_PAGE_CONTENT",
    entity: "SiteSetting",
    entityId: slug,
    metadata: { slug, keys: Object.keys(content) },
  });

  return merged;
}

export function listCmsPages() {
  return CMS_PAGES.map((page) => ({
    slug: page.slug,
    title: page.title,
    path: page.path,
    sectionCount: page.sections.length,
  }));
}
