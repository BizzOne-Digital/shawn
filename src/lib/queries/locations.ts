import { db } from "@/lib/db";
import { publishedBusinessWhere } from "@/lib/queries/business";

export async function getPublicSearchCities(): Promise<string[]> {
  try {
    const [locations, businessGroups] = await Promise.all([
      db.location.findMany({
        where: { isActive: true },
        select: { city: true },
        orderBy: { city: "asc" },
      }),
      db.business.groupBy({
        by: ["city"],
        where: { ...publishedBusinessWhere, city: { not: null } },
      }),
    ]);

    const cities = new Set<string>();
    for (const loc of locations) {
      if (loc.city?.trim()) cities.add(loc.city.trim());
    }
    for (const row of businessGroups) {
      if (row.city?.trim()) cities.add(row.city.trim());
    }

    return Array.from(cities).sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}
