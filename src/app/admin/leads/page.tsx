import Link from "next/link";
import { db } from "@/lib/db";
import { LeadSource, LeadStatus } from "@prisma/client";
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
import { Button } from "@/components/ui/button";
import { truncate, cn } from "@/lib/utils";

interface Props {
  searchParams: Promise<{ status?: string; source?: string }>;
}

function formatLeadSource(source: LeadSource) {
  return source.replace(/_/g, " ");
}

function getLgbEmailDetails(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") return null;
  const data = metadata as Record<string, unknown>;
  const requestedAddress =
    typeof data.requestedAddress === "string" ? data.requestedAddress : null;
  const backupAddress =
    typeof data.backupAddress === "string" ? data.backupAddress : null;
  const forwardTo = typeof data.forwardTo === "string" ? data.forwardTo : null;
  const businessName = typeof data.businessName === "string" ? data.businessName : null;

  if (!requestedAddress && !forwardTo) return null;
  return { requestedAddress, backupAddress, forwardTo, businessName };
}

export default async function LeadsPage({ searchParams }: Props) {
  const params = await searchParams;
  const status = params.status as LeadStatus | undefined;
  const source = params.source as LeadSource | undefined;

  const leads = await db.lead.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(source ? { source } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      business: { select: { name: true, id: true } },
    },
  });

  const sourceFilters: Array<{ label: string; value?: LeadSource }> = [
    { label: "All" },
    { label: "LGB Email", value: LeadSource.LGB_EMAIL },
    { label: "Contact", value: LeadSource.CONTACT_PAGE },
    { label: "Newsletter", value: LeadSource.NEWSLETTER },
    { label: "Business Enquiry", value: LeadSource.BUSINESS_ENQUIRY },
  ];

  return (
    <div>
      <PageHeader
        title="Leads"
        description={`${leads.length} lead${leads.length === 1 ? "" : "s"}${
          source ? ` · ${formatLeadSource(source)}` : ""
        }`}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {sourceFilters.map((filter) => {
          const active = filter.value === source || (!filter.value && !source);
          const href = filter.value ? `/admin/leads?source=${filter.value}` : "/admin/leads";
          return (
            <Button key={filter.label} variant={active ? "default" : "outline"} size="sm" asChild>
              <Link href={href}>{filter.label}</Link>
            </Button>
          );
        })}
      </div>

      <Card>
        <CardContent className="pt-6">
          {leads.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No leads found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => {
                  const lgbDetails =
                    lead.source === LeadSource.LGB_EMAIL
                      ? getLgbEmailDetails(lead.metadata)
                      : null;

                  return (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-muted">{lead.email}</p>
                          {lead.phone && <p className="text-muted">{lead.phone}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs text-sm">
                        {lgbDetails ? (
                          <div className="space-y-1">
                            {lgbDetails.requestedAddress && (
                              <p>
                                <span className="text-muted">First choice:</span>{" "}
                                <span className="font-medium">{lgbDetails.requestedAddress}</span>
                              </p>
                            )}
                            {lgbDetails.backupAddress && (
                              <p>
                                <span className="text-muted">Backup:</span>{" "}
                                <span className="font-medium">{lgbDetails.backupAddress}</span>
                              </p>
                            )}
                            {lgbDetails.forwardTo && (
                              <p>
                                <span className="text-muted">Forward to:</span> {lgbDetails.forwardTo}
                              </p>
                            )}
                            {lgbDetails.businessName && (
                              <p>
                                <span className="text-muted">Business:</span> {lgbDetails.businessName}
                              </p>
                            )}
                          </div>
                        ) : (
                          truncate(lead.message, 80)
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.business ? (
                          <Link
                            href={`/admin/businesses/${lead.business.id}`}
                            className="text-navy hover:text-buffalo-red"
                          >
                            {lead.business.name}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span
                          className={cn(
                            lead.source === LeadSource.LGB_EMAIL &&
                              "font-medium text-buffalo-red"
                          )}
                        >
                          {formatLeadSource(lead.source)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <LeadStatusBadge status={lead.status} />
                      </TableCell>
                      <TableCell className="text-muted text-sm">
                        {formatDate(lead.createdAt)}
                      </TableCell>
                      <TableCell>
                        <LeadStatusSelect leadId={lead.id} status={lead.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
