import { db } from "@/lib/db";
import { ListingStatus, Prisma } from "@prisma/client";
import { getAdminSearchTowns } from "@/lib/queries/locations";
import { isOpenNow } from "@/lib/services/business-hours";
import { getSponsoredResults } from "@/lib/services/sponsored-ranking";
import { NOT_DELETED } from "@/lib/prisma-mongo-filters";

export const publishedBusinessWhere: Prisma.BusinessWhereInput = {
  status: ListingStatus.PUBLISHED,
  ...NOT_DELETED,
};

export const businessCardInclude = {
  category: { select: { name: true, slug: true } },
  images: {
    orderBy: { sortOrder: "asc" as const },
    take: 1,
    select: { url: true, type: true },
  },
  hours: true,
} satisfies Prisma.BusinessInclude;

export async function getPopularCategories(limit = 8) {
  return db.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: limit,
    include: {
      _count: {
        select: {
          businesses: { where: publishedBusinessWhere },
        },
      },
    },
  });
}

export async function getFeaturedBusinesses(limit = 6) {
  const businesses = await db.business.findMany({
    where: { ...publishedBusinessWhere, isFeatured: true },
    include: businessCardInclude,
    orderBy: { popularityScore: "desc" },
    take: limit,
  });

  return businesses.map(enrichBusinessWithOpenStatus);
}

export async function getRecentBusinesses(limit = 6) {
  try {
    const businesses = await db.business.findMany({
      where: publishedBusinessWhere,
      include: businessCardInclude,
      orderBy: { publishedAt: "desc" },
      take: limit,
    });

    return businesses.map(enrichBusinessWithOpenStatus);
  } catch (error) {
    console.error("[getRecentBusinesses]", error);
    return [];
  }
}

export async function getSponsoredBusinesses(limit = 3) {
  try {
    const categories = await getPopularCategories(limit);
    const results: Array<{
      id: string;
      name: string;
      slug: string;
      shortDescription: string | null;
      city: string | null;
      phone: string | null;
      isVerified: boolean;
      isFeatured: boolean;
      category: { name: string; slug: string } | null;
      images: { url: string }[];
      isSponsored: boolean;
      campaignId: string;
    }> = [];
    const seen = new Set<string>();

    for (const category of categories) {
      const sponsored = await getSponsoredResults({
        categoryId: category.id,
        categorySlug: category.slug,
      });

      for (const item of sponsored) {
        if (seen.has(item.businessId)) continue;
        seen.add(item.businessId);
        results.push({
          id: item.business.id,
          name: item.business.name,
          slug: item.business.slug,
          shortDescription: item.business.shortDescription,
          city: item.business.city,
          phone: item.business.phone,
          isVerified: item.business.isVerified,
          isFeatured: false,
          category: item.business.category,
          images: item.business.images.map((img) => ({ url: img.url })),
          isSponsored: true,
          campaignId: item.campaignId,
        });
        if (results.length >= limit) return results;
      }
    }

    return results;
  } catch (error) {
    console.error("[getSponsoredBusinesses]", error);
    return [];
  }
}

export async function getSiteStats() {
  const [businessCount, categoryCount, cityCount] = await Promise.all([
    db.business.count({ where: publishedBusinessWhere }),
    db.category.count({ where: { isActive: true } }),
    db.business.groupBy({
      by: ["city"],
      where: { ...publishedBusinessWhere, city: { not: null } },
    }),
  ]);

  return {
    businessCount,
    categoryCount,
    cityCount: cityCount.length,
  };
}

export function enrichBusinessWithOpenStatus<
  T extends { hours: Parameters<typeof isOpenNow>[0] },
>(business: T) {
  return {
    ...business,
    isOpen: isOpenNow(business.hours),
  };
}

export async function getFilterOptions() {
  try {
    const [categories, cities] = await Promise.all([
      db.category.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        include: {
          subcategories: {
            where: { isActive: true },
            orderBy: { name: "asc" },
          },
        },
      }),
      getAdminSearchTowns(),
    ]);

    return { categories, cities };
  } catch (error) {
    console.error("getFilterOptions failed:", error);
    return { categories: [], cities: [] };
  }
}

export type DirectorySort = "name" | "newest" | "popular";

export interface DirectoryFilters {
  category?: string;
  subcategory?: string;
  city?: string;
  openNow?: boolean;
  verified?: boolean;
  featured?: boolean;
  sort?: DirectorySort;
  page?: number;
  limit?: number;
  view?: "grid" | "list";
}

function getDirectoryOrderBy(sort: DirectorySort): Prisma.BusinessOrderByWithRelationInput {
  switch (sort) {
    case "name":
      return { name: "asc" };
    case "popular":
      return { popularityScore: "desc" };
    case "newest":
    default:
      return { publishedAt: "desc" };
  }
}

export async function getDirectoryBusinesses(filters: DirectoryFilters) {
  const {
    category,
    subcategory,
    city,
    openNow,
    verified,
    featured,
    sort = "newest",
    page = 1,
    limit = 12,
  } = filters;

  const where: Prisma.BusinessWhereInput = {
    ...publishedBusinessWhere,
    ...(category && { category: { slug: category } }),
    ...(subcategory && { subcategory: { slug: subcategory } }),
    ...(city && {
      OR: [
        { city: { equals: city, mode: "insensitive" } },
        {
          location: {
            is: {
              city: { equals: city, mode: "insensitive" },
              isActive: true,
            },
          },
        },
      ],
    }),
    ...(verified && { isVerified: true }),
    ...(featured && { isFeatured: true }),
  };

  const orderBy = getDirectoryOrderBy(sort);

  if (openNow) {
    const all = await db.business.findMany({
      where,
      include: businessCardInclude,
      orderBy,
    });
    const open = all.filter((b) => isOpenNow(b.hours)).map(enrichBusinessWithOpenStatus);
    const total = open.length;
    const skip = (page - 1) * limit;
    return {
      businesses: open.slice(skip, skip + limit),
      total,
      totalPages: Math.ceil(total / limit),
      page,
    };
  }

  const skip = (page - 1) * limit;
  const [businesses, total] = await Promise.all([
    db.business.findMany({
      where,
      include: businessCardInclude,
      orderBy,
      skip,
      take: limit,
    }),
    db.business.count({ where }),
  ]);

  return {
    businesses: businesses.map(enrichBusinessWithOpenStatus),
    total,
    totalPages: Math.ceil(total / limit),
    page,
  };
}

export async function getBusinessBySlug(slug: string) {
  return db.business.findFirst({
    where: { slug, ...publishedBusinessWhere },
    include: {
      category: true,
      subcategory: true,
      location: true,
      hours: true,
      images: { orderBy: { sortOrder: "asc" } },
      socialLinks: true,
    },
  });
}

export async function getRelatedBusinesses(
  businessId: string,
  categoryId: string | null,
  limit = 4
) {
  if (!categoryId) return [];

  const businesses = await db.business.findMany({
    where: {
      ...publishedBusinessWhere,
      categoryId,
      id: { not: businessId },
    },
    include: businessCardInclude,
    orderBy: { popularityScore: "desc" },
    take: limit,
  });

  return businesses.map(enrichBusinessWithOpenStatus);
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findFirst({
    where: { slug, isActive: true },
    include: {
      subcategories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function getBusinessesByCategory(
  categorySlug: string,
  page = 1,
  limit = 12
) {
  const where: Prisma.BusinessWhereInput = {
    ...publishedBusinessWhere,
    category: { slug: categorySlug },
  };

  const skip = (page - 1) * limit;
  const [businesses, total] = await Promise.all([
    db.business.findMany({
      where,
      include: businessCardInclude,
      orderBy: { popularityScore: "desc" },
      skip,
      take: limit,
    }),
    db.business.count({ where }),
  ]);

  return {
    businesses: businesses.map(enrichBusinessWithOpenStatus),
    total,
    totalPages: Math.ceil(total / limit),
    page,
  };
}

export async function getHomepageData() {
  try {
    const [categories, sponsored, featured, recent, stats] = await Promise.all([
      getPopularCategories(8),
      getSponsoredBusinesses(3),
      getFeaturedBusinesses(6),
      getRecentBusinesses(6),
      getSiteStats(),
    ]);

    return {
      categories,
      sponsored,
      featured,
      recent,
      stats,
      dbUnavailable: false,
    };
  } catch (error) {
    console.error("[Homepage] Database unavailable:", error);
    return {
      categories: [],
      sponsored: [],
      featured: [],
      recent: [],
      stats: { businessCount: 0, categoryCount: 0, cityCount: 0 },
      dbUnavailable: true,
    };
  }
}
