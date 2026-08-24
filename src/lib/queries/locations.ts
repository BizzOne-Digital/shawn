import { db } from "@/lib/db";
import { publishedBusinessWhere } from "@/lib/queries/business";

/**
 * Towns for the optional search/directory location dropdown.
 * Only includes cities the admin added under Locations (active).
 * Does not auto-populate from business listings alone.
 */
export async function getAdminSearchTowns(): Promise<string[]> {
  try {
    const locations = await db.location.findMany({
      where: { isActive: true },
      select: { city: true },
      orderBy: { city: "asc" },
    });

    const towns = new Set<string>();
    for (const location of locations) {
      const city = location.city?.trim();
      if (city) towns.add(city);
    }

    return Array.from(towns).sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

/**
 * Cities that appear on published business listings (for suggestions / display).
 */
export async function getListedBusinessCities(): Promise<string[]> {
  try {
    const rows = await db.business.groupBy({
      by: ["city"],
      where: { ...publishedBusinessWhere, city: { not: null } },
    });

    return rows
      .map((row) => row.city?.trim())
      .filter((city): city is string => Boolean(city))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

/** @deprecated Use getAdminSearchTowns — kept for existing imports */
export async function getPublicSearchCities(): Promise<string[]> {
  return getAdminSearchTowns();
}
