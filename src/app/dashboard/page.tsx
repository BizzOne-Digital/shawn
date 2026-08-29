import Link from "next/link";
import { db } from "@/lib/db";
import { requireBusinessOwner } from "@/lib/auth-utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getListingStatusLabel } from "@/lib/business-utils";
import {
  Eye,
  Search,
  MousePointerClick,
  Users,
  PlusCircle,
  Building2,
} from "lucide-react";
import { NOT_DELETED } from "@/lib/prisma-mongo-filters";

export default async function DashboardPage() {
  const user = await requireBusinessOwner();

  const businesses = await db.business.findMany({
    where: { ownerId: user.id, ...NOT_DELETED },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const stats = businesses.reduce(
    (acc, b) => ({
      views: acc.views + b.viewCount,
      impressions: acc.impressions + b.searchImpressions,
      clicks: acc.clicks + b.websiteClicks + b.phoneClicks + b.socialClicks,
    }),
    { views: 0, impressions: 0, clicks: 0 }
  );

  const leads = await db.lead.count({
    where: { business: { ownerId: user.id } },
  });

  const wallet = await db.wallet.findUnique({
    where: { userId: user.id },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">
            Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-muted mt-1">Manage your businesses and track performance</p>
        </div>
        <Link href="/dashboard/submit">
          <Button variant="accent">
            <PlusCircle className="size-4" />
            Add Business
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Profile Views" value={stats.views.toLocaleString()} icon={Eye} />
        <StatCard title="Search Impressions" value={stats.impressions.toLocaleString()} icon={Search} />
        <StatCard title="Total Clicks" value={stats.clicks.toLocaleString()} icon={MousePointerClick} />
        <StatCard title="Leads" value={leads.toLocaleString()} icon={Users} />
      </div>

      <div className="rounded-xl border border-navy/10 bg-white p-5">
        <h2 className="font-display text-lg font-semibold text-navy">How listing works</h2>
        <ol className="mt-3 grid gap-2 text-sm text-muted sm:grid-cols-4">
          <li><span className="font-medium text-navy">1. Submit</span> — complete the form and send for review</li>
          <li><span className="font-medium text-navy">2. Admin review</span> — our team checks your details</li>
          <li><span className="font-medium text-navy">3. Categorized</span> — admin assigns the right category</li>
          <li><span className="font-medium text-navy">4. Published</span> — your listing goes live on the directory</li>
        </ol>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Recent Businesses</CardTitle>
            <Link href="/dashboard/businesses">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {businesses.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="size-12 text-muted mx-auto mb-4" />
                <p className="text-muted mb-4">You haven&apos;t listed any businesses yet</p>
                <Link href="/dashboard/submit">
                  <Button variant="accent">List Your First Business</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {businesses.map((business) => (
                  <Link
                    key={business.id}
                    href={`/dashboard/businesses/${business.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-soft-gray transition-colors"
                  >
                    <div>
                      <p className="font-medium text-navy">{business.name}</p>
                      <p className="text-sm text-muted">{business.city ?? "No location"}</p>
                    </div>
                    <Badge variant={business.status === "PUBLISHED" ? "default" : "secondary"}>
                      {getListingStatusLabel(business.status)}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-navy">
              ${Number(wallet?.balance ?? 0).toFixed(2)}
            </p>
            <p className="text-sm text-muted mt-1">Available for advertising</p>
            <Link href="/dashboard/billing" className="block mt-4">
              <Button className="w-full" variant="outline">Add Funds</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
