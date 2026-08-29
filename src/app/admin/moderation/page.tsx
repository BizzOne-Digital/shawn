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
import { ListingStatusBadge } from "@/components/admin/status-badge";
import { formatDate } from "@/lib/admin-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NOT_DELETED } from "@/lib/prisma-mongo-filters";

export default async function ModerationPage() {
  const pendingBusinesses = await db.business.findMany({
    where: {
      status: {
        in: [
          ListingStatus.PENDING_REVIEW,
          ListingStatus.CHANGES_REQUESTED,
        ],
      },
      ...NOT_DELETED,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      owner: { select: { name: true, email: true } },
      category: { select: { name: true } },
      submissions: { orderBy: { submittedAt: "desc" }, take: 1 },
    },
  });

  return (
    <div>
      <PageHeader
        title="Moderation Queue"
        description={`${pendingBusinesses.length} submission${pendingBusinesses.length !== 1 ? "s" : ""} awaiting review`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Pending Submissions</CardTitle>
          <CardDescription>
            Review and approve, reject, or request changes on business listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingBusinesses.length === 0 ? (
            <p className="text-center text-muted py-12">
              No pending submissions. All caught up!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingBusinesses.map((business) => (
                  <TableRow key={business.id}>
                    <TableCell>
                      <div>
                        <Link
                          href={`/admin/moderation/${business.id}`}
                          className="font-medium text-navy hover:text-buffalo-red"
                        >
                          {business.name}
                        </Link>
                        {business.suggestedCategory && (
                          <p className="text-xs text-muted mt-0.5">
                            Suggested: {business.suggestedCategory}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{business.owner.name ?? "—"}</p>
                        <p className="text-muted">{business.owner.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{business.category?.name ?? "Unassigned"}</TableCell>
                    <TableCell>
                      <ListingStatusBadge status={business.status} />
                    </TableCell>
                    <TableCell className="text-muted text-sm">
                      {business.submissions[0]
                        ? formatDate(business.submissions[0].submittedAt)
                        : formatDate(business.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" asChild>
                        <Link href={`/admin/moderation/${business.id}`}>
                          Review
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
