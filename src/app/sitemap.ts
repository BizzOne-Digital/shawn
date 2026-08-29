import type { MetadataRoute } from "next";
import { ListingStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { NOT_DELETED } from "@/lib/prisma-mongo-filters";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://letsgobuffalo.com";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/directory", priority: 0.9 },
    { path: "/search", priority: 0.8 },
    { path: "/about", priority: 0.6 },
    { path: "/contact", priority: 0.6 },
    { path: "/advertise", priority: 0.7 },
    { path: "/email-enrollment", priority: 0.7 },
    { path: "/community", priority: 0.7 },
    { path: "/fan-page", priority: 0.6 },
    { path: "/gear", priority: 0.6 },
    { path: "/pricing", priority: 0.7 },
    { path: "/terms", priority: 0.3 },
    { path: "/privacy", priority: 0.3 },
  ];

  const staticPages = staticRoutes.map(({ path, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority,
  }));

  try {
    const [businesses, categories] = await Promise.all([
      db.business.findMany({
        where: { status: ListingStatus.PUBLISHED, ...NOT_DELETED },
        select: { slug: true, updatedAt: true },
      }),
      db.category.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    return [
      ...staticPages,
      ...categories.map((category) => ({
        url: `${BASE_URL}/categories/${category.slug}`,
        lastModified: category.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...businesses.map((business) => ({
        url: `${BASE_URL}/business/${business.slug}`,
        lastModified: business.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return staticPages;
  }
}
