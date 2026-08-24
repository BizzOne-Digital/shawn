import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { LocationManager } from "@/components/admin/location-manager";
import { Card, CardContent } from "@/components/ui/card";

export default async function LocationsPage() {
  const locations = await db.location.findMany({
    orderBy: { city: "asc" },
    include: { _count: { select: { businesses: true } } },
  });

  return (
    <div>
      <PageHeader title="Locations" description={`${locations.length} towns in Western New York`} />

      <Card className="mb-6 border-dashed">
        <CardContent className="py-4 text-sm text-muted">
          Towns added here appear as an optional filter on Search and the Business Directory
          (with an <strong className="text-navy">All</strong> option). Visitors can always search
          by typing a business name, service, or town — results come from published listings.
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <LocationManager
            locations={locations.map((loc) => ({
              id: loc.id,
              city: loc.city,
              state: loc.state,
              region: loc.region,
              zipCode: loc.zipCode,
              slug: loc.slug,
              isActive: loc.isActive,
              businessCount: loc._count.businesses,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
