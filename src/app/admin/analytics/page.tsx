import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { StatsCard } from "@/components/admin/stats-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, TrendingUp, MapPin, Tag } from "lucide-react";
import { formatDate } from "@/lib/admin-utils";

export default async function AnalyticsPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalSearches,
    recentSearches,
    topQueries,
    topCities,
    topCategories,
    recentSearchList,
  ] = await Promise.all([
    db.searchQuery.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.searchQuery.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    db.searchQuery.groupBy({
      by: ["query"],
      where: { createdAt: { gte: thirtyDaysAgo }, query: { not: "" } },
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 10,
    }),
    db.searchQuery.groupBy({
      by: ["city"],
      where: { createdAt: { gte: thirtyDaysAgo }, city: { not: null } },
      _count: { city: true },
      orderBy: { _count: { city: "desc" } },
      take: 10,
    }),
    db.searchQuery.groupBy({
      by: ["category"],
      where: { createdAt: { gte: thirtyDaysAgo }, category: { not: null } },
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
      take: 10,
    }),
    db.searchQuery.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div>
      <PageHeader title="Search Analytics" description="Platform search trends and metrics" />

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <StatsCard title="Searches (30d)" value={totalSearches} icon={Search} />
        <StatsCard title="Searches (7d)" value={recentSearches} icon={TrendingUp} />
        <StatsCard title="Unique Queries" value={topQueries.length} icon={Tag} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Top Queries</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topQueries.map((q) => (
                  <TableRow key={q.query}>
                    <TableCell>{q.query}</TableCell>
                    <TableCell className="text-right">{q._count.query}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Top Cities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>City</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCities.map((c) => (
                  <TableRow key={c.city}>
                    <TableCell>{c.city}</TableCell>
                    <TableCell className="text-right">{c._count.city}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCategories.map((c) => (
                  <TableRow key={c.category}>
                    <TableCell>{c.category}</TableCell>
                    <TableCell className="text-right">{c._count.category}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Searches</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Query</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Results</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSearchList.map((search) => (
                <TableRow key={search.id}>
                  <TableCell>{search.query || "—"}</TableCell>
                  <TableCell>{search.city ?? "—"}</TableCell>
                  <TableCell>{search.category ?? "—"}</TableCell>
                  <TableCell>{search.results}</TableCell>
                  <TableCell className="text-muted text-sm">{formatDate(search.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
