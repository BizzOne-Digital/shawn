import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireBusinessOwner } from "@/lib/auth-utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Eye, MousePointerClick, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";

type PageProps = { params: Promise<{ id: string }> };

export default async function CampaignDetailPage({ params }: PageProps) {
  const user = await requireBusinessOwner();
  const { id } = await params;

  const campaign = await db.advertisingCampaign.findFirst({
    where: { id, ownerId: user.id },
    include: {
      business: { select: { name: true, slug: true } },
      targets: true,
    },
  });

  if (!campaign) notFound();

  const ctr = campaign.impressions > 0
    ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
    : "0.00";

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/advertising">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="size-4" />
            Back to Campaigns
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl font-bold text-navy">{campaign.name}</h1>
          <Badge>{campaign.status.replace(/_/g, " ")}</Badge>
        </div>
        <p className="text-muted mt-1">{campaign.business.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Impressions" value={campaign.impressions.toLocaleString()} icon={Eye} />
        <StatCard title="Clicks" value={campaign.clicks.toLocaleString()} icon={MousePointerClick} />
        <StatCard title="Leads" value={campaign.leads.toLocaleString()} icon={Users} />
        <StatCard title="Spent" value={formatCurrency(Number(campaign.spentAmount))} icon={DollarSign} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Daily Bid</span>
              <span className="font-medium">{formatCurrency(Number(campaign.dailyBid))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Total Budget</span>
              <span className="font-medium">
                {campaign.totalBudget ? formatCurrency(Number(campaign.totalBudget)) : "Unlimited"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Start Date</span>
              <span className="font-medium">{format(campaign.startDate, "MMM d, yyyy")}</span>
            </div>
            {campaign.endDate && (
              <div className="flex justify-between">
                <span className="text-muted">End Date</span>
                <span className="font-medium">{format(campaign.endDate, "MMM d, yyyy")}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted">Click-through Rate</span>
              <span className="font-medium">{ctr}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Targeting</CardTitle>
          </CardHeader>
          <CardContent>
            {campaign.targets.length === 0 ? (
              <p className="text-sm text-muted">All searches</p>
            ) : (
              <div className="space-y-2">
                {campaign.targets.map((target) => (
                  <div key={target.id} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{target.targetType}</Badge>
                    {target.value && <span>{target.value}</span>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
