import Link from "next/link";
import { db } from "@/lib/db";
import { ListingStatus } from "@prisma/client";
import { PageHeader } from "@/components/admin/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BusinessFilters } from "@/components/admin/business-filters";
import { ListingStatusBadge } from "@/components/admin/status-badge";
import { formatDate } from "@/lib/admin-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { NOT_DELETED } from "@/lib/prisma-mongo-filters";

interface Props {
  searchParams: Promise<{
    q?: string;
    status?: string;
    category?: string;
  }>;
}

export default async function BusinessesPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q ?? "";
  const status = params.status as ListingStatus | undefined;
  const categoryId = params.category;

  const [businesses, categories] = await Promise.all([
    db.business.findMany({
      where: {
        ...NOT_DELETED,
        ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
        ...(status ? { status } : { status: { not: ListingStatus.DRAFT } }),
        ...(categoryId ? { categoryId } : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: {
        owner: { select: { name: true, email: true } },
        category: { select: { name: true } },
      },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Businesses" description={`${businesses.length} listings (drafts hidden by default)`}>
        <Button variant="accent" asChild>
          <Link href="/admin/businesses/new">
            <Plus className="h-4 w-4" />
            Add Business
          </Link>
        </Button>
      </PageHeader>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <BusinessFilters categories={categories} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businesses.map((business) => (
                <TableRow key={business.id}>
                  <TableCell>
                    <Link
                      href={`/admin/businesses/${business.id}`}
                      className="font-medium text-navy hover:text-buffalo-red"
                    >
                      {business.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{business.owner.email}</TableCell>
                  <TableCell>{business.category?.name ?? "—"}</TableCell>
                  <TableCell><ListingStatusBadge status={business.status} /></TableCell>
                  <TableCell className="text-muted text-sm">{formatDate(business.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/businesses/${business.id}`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
