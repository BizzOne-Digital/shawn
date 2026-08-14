import Link from "next/link";
import { db } from "@/lib/db";
import { LeadStatus } from "@prisma/client";
import { PageHeader } from "@/components/admin/page-header";
import { LeadStatusSelect } from "@/components/admin/lead-status-select";
import { LeadStatusBadge } from "@/components/admin/status-badge";
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

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function LeadsPage({ searchParams }: Props) {
  const params = await searchParams;
  const status = params.status as LeadStatus | undefined;

  const leads = await db.lead.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      business: { select: { name: true, id: true } },
    },
  });

  return (
    <div>
      <PageHeader title="Leads" description={`${leads.length} leads`} />

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-muted">{lead.email}</p>
                      {lead.phone && <p className="text-muted">{lead.phone}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.business ? (
                      <Link href={`/admin/businesses/${lead.business.id}`} className="text-navy hover:text-buffalo-red">
                        {lead.business.name}
                      </Link>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="max-w-xs text-sm">{truncate(lead.message, 80)}</TableCell>
                  <TableCell className="text-sm">{lead.source.replace(/_/g, " ")}</TableCell>
                  <TableCell><LeadStatusBadge status={lead.status} /></TableCell>
                  <TableCell className="text-muted text-sm">{formatDate(lead.createdAt)}</TableCell>
                  <TableCell>
                    <LeadStatusSelect leadId={lead.id} status={lead.status} />
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
