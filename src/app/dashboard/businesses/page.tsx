import Link from "next/link";
import { db } from "@/lib/db";
import { requireBusinessOwner } from "@/lib/auth-utils";
import { getListingStatusLabel } from "@/lib/business-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Building2, Eye, Edit } from "lucide-react";

export default async function MyBusinessesPage() {
  const user = await requireBusinessOwner();

  const businesses = await db.business.findMany({
    where: { ownerId: user.id, deletedAt: null },
    include: {
      category: { select: { name: true } },
      images: { where: { type: "LOGO" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">My Businesses</h1>
          <p className="text-muted mt-1">{businesses.length} listing{businesses.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/submit">
          <Button variant="accent">
            <PlusCircle className="size-4" />
            Add Business
          </Button>
        </Link>
      </div>

      {businesses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="size-12 text-muted mx-auto mb-4" />
            <p className="text-muted mb-4">No businesses listed yet</p>
            <Link href="/dashboard/submit">
              <Button variant="accent">Get Started</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {businesses.map((business) => (
            <Card key={business.id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    {business.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={business.images[0].url}
                        alt={business.name}
                        className="size-14 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="size-14 rounded-lg bg-soft-gray flex items-center justify-center">
                        <Building2 className="size-6 text-muted" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-navy">{business.name}</h3>
                      <p className="text-sm text-muted">
                        {business.category?.name ?? "Uncategorized"}
                        {business.city ? ` · ${business.city}` : ""}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Eye className="size-3" />
                          {business.viewCount} views
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={business.status === "PUBLISHED" ? "default" : "secondary"}>
                      {getListingStatusLabel(business.status)}
                    </Badge>
                    <Link href={`/dashboard/businesses/${business.id}/status`}>
                      <Button variant="ghost" size="sm">Status</Button>
                    </Link>
                    <Link href={`/dashboard/businesses/${business.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="size-4" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
