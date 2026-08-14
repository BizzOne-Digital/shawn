import Link from "next/link";
import { db } from "@/lib/db";
import { ReportStatus } from "@prisma/client";
import { PageHeader } from "@/components/admin/page-header";
import { ReportStatusSelect } from "@/components/admin/report-status-select";
import { ReportStatusBadge } from "@/components/admin/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/admin-utils";
import { Card, CardContent } from "@/components/ui/card";
import { truncate } from "@/lib/utils";

export default async function ReportsPage() {
  const reports = await db.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      business: { select: { name: true, id: true } },
      user: { select: { name: true, email: true } },
    },
  });

  const pendingCount = reports.filter((r) => r.status === ReportStatus.PENDING).length;

  return (
    <div>
      <PageHeader title="Flagged Listings" description={`${reports.length} reports · ${pendingCount} pending`} />

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Link href={`/admin/businesses/${report.business.id}`} className="font-medium text-navy hover:text-buffalo-red">
                      {report.business.name}
                    </Link>
                  </TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell className="max-w-xs text-sm">{report.details ? truncate(report.details, 60) : "—"}</TableCell>
                  <TableCell className="text-sm">{report.user?.email ?? "Anonymous"}</TableCell>
                  <TableCell><ReportStatusBadge status={report.status} /></TableCell>
                  <TableCell className="text-muted text-sm">{formatDate(report.createdAt)}</TableCell>
                  <TableCell>
                    <ReportStatusSelect reportId={report.id} status={report.status} />
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
