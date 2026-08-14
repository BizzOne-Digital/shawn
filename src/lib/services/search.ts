import { db } from "@/lib/db";
import { ListingStatus, Prisma } from "@prisma/client";
import { getSponsoredResults, recordAdImpressions } from "./sponsored-ranking";

export interface SearchParams {
  q: string;
  page?: number;
  limit?: number;
  city?: string;
  category?: string;
  userId?: string;
}

export interface SearchResultItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  isVerified: boolean;
  isOpen: boolean;
  category: { name: string; slug: string } | null;
  socialLinks: { platform: string; url: string }[];
  isSponsored?: boolean;
  sponsoredPosition?: number;
  campaignId?: string;
}

export interface SearchResults {
  query: string;
  sponsored: SearchResultItem[];
  organic: SearchResultItem[];
  total: number;
  page: number;
  totalPages: number;
  suggestions: string[];
}

function buildSearchWhere(query: string, filters?: { city?: string; category?: string }): Prisma.BusinessWhereInput {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  const searchConditions: Prisma.BusinessWhereInput[] = terms.length > 0
    ? terms.map((term) => ({
        OR: [
          { name: { contains: term, mode: "insensitive" as const } },
          { description: { contains: term, mode: "insensitive" as const } },
          { shortDescription: { contains: term, mode: "insensitive" as const } },
          { services: { has: term } },
          { tags: { has: term } },
          { city: { contains: term, mode: "insensitive" as const } },
          { address: { contains: term, mode: "insensitive" as const } },
          { category: { name: { contains: term, mode: "insensitive" as const } } },
        ],
      }))
    : [];

  const where: Prisma.BusinessWhereInput = {
    status: ListingStatus.PUBLISHED,
    deletedAt: null,
    ...(filters?.city && { city: { equals: filters.city, mode: "insensitive" } }),
    ...(filters?.category && {
      category: { slug: filters.category },
    }),
    ...(searchConditions.length > 0 && { AND: searchConditions }),
  };

  return where;
}

function calculateRelevanceScore(business: {
  name: string;
  description: string | null;
  services: string[];
  tags: string[];
  popularityScore: number;
}, query: string): number {
  const q = query.toLowerCase();
  let score = business.popularityScore;

  if (business.name.toLowerCase().includes(q)) score += 100;
  if (business.name.toLowerCase().startsWith(q)) score += 50;
  if (business.description?.toLowerCase().includes(q)) score += 30;
  if (business.services.some((s) => s.toLowerCase().includes(q))) score += 20;
  if (business.tags.some((t) => t.toLowerCase().includes(q))) score += 15;

  const terms = q.split(/\s+/);
  for (const term of terms) {
    if (business.name.toLowerCase().includes(term)) score += 10;
  }

  return score;
}

function isBusinessOpenNow(hours: { dayOfWeek: string; openTime: string | null; closeTime: string | null; isClosed: boolean; is24Hours: boolean }[]): boolean {
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const now = new Date();
  const today = days[now.getDay()];
  const todayHours = hours.find((h) => h.dayOfWeek === today);

  if (!todayHours || todayHours.isClosed) return false;
  if (todayHours.is24Hours) return true;

  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return !!(todayHours.openTime && todayHours.closeTime && currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime);
}

export async function searchBusinesses(params: SearchParams): Promise<SearchResults> {
  const { q, page = 1, limit = 10, city, category, userId } = params;
  const query = q.trim();
  const skip = (page - 1) * limit;

  const categoryRecord = category
    ? await db.category.findUnique({ where: { slug: category } })
    : null;

  const sponsoredRaw = await getSponsoredResults({
    query,
    categoryId: categoryRecord?.id,
    categorySlug: category,
    city,
  });

  const sponsoredBusinessIds = new Set(sponsoredRaw.map((s) => s.businessId));

  const where = buildSearchWhere(query, { city, category });

  const [businesses, total] = await Promise.all([
    db.business.findMany({
      where: {
        ...where,
        id: { notIn: Array.from(sponsoredBusinessIds) },
      },
      include: {
        category: { select: { name: true, slug: true } },
        socialLinks: { select: { platform: true, url: true } },
        hours: true,
      },
      skip,
      take: limit,
    }),
    db.business.count({
      where: {
        ...where,
        id: { notIn: Array.from(sponsoredBusinessIds) },
      },
    }),
  ]);

  const scoredBusinesses = businesses
    .map((b) => ({
      business: b,
      score: calculateRelevanceScore(b, query),
    }))
    .sort((a, b) => b.score - a.score);

  const sponsored: SearchResultItem[] = sponsoredRaw.map((s) => ({
    id: s.business.id,
    name: s.business.name,
    slug: s.business.slug,
    shortDescription: s.business.shortDescription,
    description: s.business.description,
    city: s.business.city,
    address: null,
    phone: s.business.phone,
    website: s.business.website,
    isVerified: s.business.isVerified,
    isOpen: false,
    category: s.business.category,
    socialLinks: [],
    isSponsored: true,
    sponsoredPosition: s.position,
    campaignId: s.campaignId,
  }));

  const organic: SearchResultItem[] = scoredBusinesses.map(({ business: b }) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    shortDescription: b.shortDescription,
    description: b.description,
    city: b.city,
    address: b.address,
    phone: b.phone,
    website: b.website,
    isVerified: b.isVerified,
    isOpen: isBusinessOpenNow(b.hours),
    category: b.category,
    socialLinks: b.socialLinks,
  }));

  if (query) {
    await db.searchQuery.create({
      data: {
        query,
        userId,
        results: total + sponsored.length,
        city,
        category,
      },
    });
  }

  if (sponsoredRaw.length > 0) {
    await recordAdImpressions(sponsoredRaw, query);
  }

  const suggestions = await getSearchSuggestions(query);

  return {
    query,
    sponsored,
    organic,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    suggestions,
  };
}

export async function getSearchSuggestions(query: string, limit = 5): Promise<string[]> {
  if (!query.trim() || query.length < 2) return [];

  const [recentQueries, businessNames] = await Promise.all([
    db.searchQuery.groupBy({
      by: ["query"],
      where: { query: { contains: query, mode: "insensitive" } },
      orderBy: { _count: { query: "desc" } },
      take: limit,
    }),
    db.business.findMany({
      where: {
        status: ListingStatus.PUBLISHED,
        name: { contains: query, mode: "insensitive" },
      },
      select: { name: true },
      take: limit,
    }),
  ]);

  const suggestions = new Set<string>();
  recentQueries.forEach((q) => suggestions.add(q.query));
  businessNames.forEach((b) => suggestions.add(b.name));

  return Array.from(suggestions).slice(0, limit);
}

export async function getUserSearchHistory(userId: string, limit = 10): Promise<string[]> {
  const queries = await db.searchQuery.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit * 2,
    distinct: ["query"],
  });

  return queries.slice(0, limit).map((q) => q.query);
}
