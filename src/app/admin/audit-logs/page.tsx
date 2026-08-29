import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
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

interface Props {
  searchParams: Promise<{ entity?: string; page?: string }>;
}

export default async function AuditLogsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1") || 1);
  const pageSize = 50;

  const where = params.entity ? { entity: params.entity } : {};

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { name: true, email: true } } },
    }),
    db.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <PageHeader title="Audit Logs" description={`${total} total entries`} />

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell>{log.entity}</TableCell>
                  <TableCell className="font-mono text-xs">{log.entityId?.slice(0, 12) ?? "—"}</TableCell>
                  <TableCell className="text-sm">{log.user?.name ?? log.user?.email ?? "System"}</TableCell>
                  <TableCell className="text-muted text-sm">{log.ipAddress ?? "—"}</TableCell>
                  <TableCell className="text-muted text-sm">{formatDate(log.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/admin/audit-logs?page=${p}${params.entity ? `&entity=${params.entity}` : ""}`}
                  className={`px-3 py-1 rounded text-sm ${p === page ? "bg-navy text-white" : "bg-soft-gray text-navy hover:bg-soft-gray-dark"}`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
