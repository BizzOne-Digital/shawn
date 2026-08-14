import Link from "next/link";
import {
  Building2,
  ClipboardCheck,
  Megaphone,
  Mail,
  Flag,
  Users,
  TrendingUp,
} from "lucide-react";
import { db } from "@/lib/db";
import { ListingStatus, CampaignStatus, LeadStatus, ReportStatus } from "@prisma/client";
import { StatsCard } from "@/components/admin/stats-card";
import { PageHeader } from "@/components/admin/page-header";
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
import { Button } from "@/components/ui/button";
import { ListingStatusBadge } from "@/components/admin/status-badge";
import { formatDate } from "@/lib/admin-utils";

export default async function AdminDashboardPage() {
  const [
    pendingReview,
    totalBusinesses,
    pendingCampaigns,
    newLeads,
    pendingReports,
    totalUsers,
    recentBusinesses,
    recentAuditLogs,
  ] = await Promise.all([
    db.business.count({
      where: {
        status: {
          in: [ListingStatus.PENDING_REVIEW, ListingStatus.CHANGES_REQUESTED],
        },
        deletedAt: null,
      },
    }),
    db.business.count({ where: { deletedAt: null } }),
    db.advertisingCampaign.count({ where: { status: CampaignStatus.PENDING_APPROVAL } }),
    db.lead.count({ where: { status: LeadStatus.NEW } }),
    db.report.count({ where: { status: ReportStatus.PENDING } }),
    db.user.count({ where: { deletedAt: null } }),
    db.business.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { owner: { select: { name: true, email: true } } },
    }),
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of platform activity and pending tasks"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        <StatsCard
          title="Pending Review"
          value={pendingReview}
          icon={ClipboardCheck}
          description="Listings awaiting moderation"
        />
        <StatsCard
          title="Total Businesses"
          value={totalBusinesses}
          icon={Building2}
          description="Active listings in directory"
        />
        <StatsCard
          title="Campaign Queue"
          value={pendingCampaigns}
          icon={Megaphone}
          description="Ads pending approval"
        />
        <StatsCard
          title="New Leads"
          value={newLeads}
          icon={Mail}
          description="Uncontacted leads"
        />
        <StatsCard
          title="Flagged Reports"
          value={pendingReports}
          icon={Flag}
          description="Reports to review"
        />
        <StatsCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          description="Registered accounts"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Recent Businesses</CardTitle>
              <CardDescription>Latest submitted listings</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/businesses">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBusinesses.map((business) => (
                  <TableRow key={business.id}>
                    <TableCell>
                      <Link
                        href={`/admin/businesses/${business.id}`}
                        className="font-medium text-navy hover:text-buffalo-red"
                      >
                        {business.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <ListingStatusBadge status={business.status} />
                    </TableCell>
                    <TableCell className="text-muted text-sm">
                      {formatDate(business.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest admin actions</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/audit-logs">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAuditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <span className="font-medium">{log.action}</span>
                      <span className="block text-xs text-muted">
                        {log.entity}
                        {log.entityId ? ` · ${log.entityId.slice(0, 8)}…` : ""}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.user?.name ?? log.user?.email ?? "System"}
                    </TableCell>
                    <TableCell className="text-muted text-sm">
                      {formatDate(log.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-buffalo-red">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Moderation Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-navy">{pendingReview}</p>
            <Button className="mt-4" variant="accent" asChild>
              <Link href="/admin/moderation">Review Submissions</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-navy">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Campaign Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-navy">{pendingCampaigns}</p>
            <Button className="mt-4" variant="outline" asChild>
              <Link href="/admin/campaigns">Review Campaigns</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-light-blue">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted text-sm">View search trends and platform metrics</p>
            <Button className="mt-4" variant="outline" asChild>
              <Link href="/admin/analytics">View Analytics</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
