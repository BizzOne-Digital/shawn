import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { CampaignStatusBadge } from "@/components/admin/status-badge";
import { CampaignActions } from "@/components/admin/campaign-actions";
import { WalletCreditForm } from "@/components/admin/wallet-credit-form";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/admin-utils";
import { getMinimumDailyBid } from "@/lib/services/ad-settings";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({ params }: Props) {
  const { id } = await params;
  const minimumDailyBid = await getMinimumDailyBid();

  const campaign = await db.advertisingCampaign.findUnique({
    where: { id },
    include: {
      business: { select: { name: true, slug: true } },
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          wallet: { select: { balance: true } },
        },
      },
      targets: true,
    },
  });

  if (!campaign) notFound();

  const walletBalance = Number(campaign.owner.wallet?.balance ?? 0);
  const canCoverBid = walletBalance >= Number(campaign.dailyBid);

  return (
    <div>
      <PageHeader title={campaign.name} description={`Campaign for ${campaign.business.name}`}>
        <CampaignStatusBadge status={campaign.status} />
        <Button variant="outline" asChild>
          <Link href="/admin/campaigns">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Campaign Details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
              <div><span className="text-muted">Daily Bid:</span> {formatCurrency(Number(campaign.dailyBid))}</div>
              <div><span className="text-muted">Minimum Bid:</span> {formatCurrency(minimumDailyBid)}</div>
              <div><span className="text-muted">Total Budget:</span> {campaign.totalBudget ? formatCurrency(Number(campaign.totalBudget)) : "Unlimited"}</div>
              <div><span className="text-muted">Spent:</span> {formatCurrency(Number(campaign.spentAmount))}</div>
              <div><span className="text-muted">Start Date:</span> {formatDate(campaign.startDate)}</div>
              <div><span className="text-muted">End Date:</span> {formatDate(campaign.endDate)}</div>
              <div><span className="text-muted">Owner:</span> {campaign.owner.email}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Performance</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3 text-sm">
              <div><span className="text-muted">Impressions:</span> {campaign.impressions.toLocaleString()}</div>
              <div><span className="text-muted">Clicks:</span> {campaign.clicks.toLocaleString()}</div>
              <div><span className="text-muted">Leads:</span> {campaign.leads.toLocaleString()}</div>
            </CardContent>
          </Card>

          {campaign.targets.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Targeting</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {campaign.targets.map((target) => (
                  <div key={target.id} className="text-sm">
                    <span className="font-medium">{target.targetType}</span>
                    {target.value && <span className="text-muted"> · {target.value}</span>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {campaign.rejectionReason && (
            <Card className="border-buffalo-red">
              <CardHeader><CardTitle>Rejection Reason</CardTitle></CardHeader>
              <CardContent><p className="text-sm">{campaign.rejectionReason}</p></CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Owner Wallet</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p className="text-muted">Current balance</p>
                <p className="text-2xl font-bold text-navy">{formatCurrency(walletBalance)}</p>
              </div>
              {!canCoverBid && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Balance is below the daily bid ({formatCurrency(Number(campaign.dailyBid))}).
                  Fund this account so the campaign can run.
                </p>
              )}
              <WalletCreditForm
                userId={campaign.owner.id}
                userName={campaign.owner.name}
                userEmail={campaign.owner.email}
                currentBalance={walletBalance}
                campaignId={campaign.id}
                defaultNote={`Advertising fund for campaign: ${campaign.name}`}
                triggerLabel="Fund Bid Wallet"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
            <CardContent>
              <CampaignActions campaignId={campaign.id} status={campaign.status} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
