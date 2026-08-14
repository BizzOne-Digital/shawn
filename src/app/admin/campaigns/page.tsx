import Link from "next/link";
import { db } from "@/lib/db";
import { CampaignStatus } from "@prisma/client";
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
import { CampaignStatusBadge } from "@/components/admin/status-badge";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/admin-utils";
import { Card, CardContent } from "@/components/ui/card";

export default async function CampaignsPage() {
  const campaigns = await db.advertisingCampaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      business: { select: { name: true, slug: true } },
      owner: { select: { name: true, email: true } },
    },
  });

  const pendingCount = campaigns.filter((c) => c.status === CampaignStatus.PENDING_APPROVAL).length;

  return (
    <div>
      <PageHeader
        title="Advertising Campaigns"
        description={`${campaigns.length} campaigns · ${pendingCount} pending approval`}
      />

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Daily Bid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{campaign.business.name}</TableCell>
                  <TableCell className="text-sm">{campaign.owner.email}</TableCell>
                  <TableCell>{formatCurrency(Number(campaign.dailyBid))}</TableCell>
                  <TableCell><CampaignStatusBadge status={campaign.status} /></TableCell>
                  <TableCell className="text-muted text-sm">{formatDate(campaign.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/campaigns/${campaign.id}`}>Review</Link>
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
