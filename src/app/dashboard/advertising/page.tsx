import Link from "next/link";
import { db } from "@/lib/db";
import { requireBusinessOwner } from "@/lib/auth-utils";
import { getMinimumDailyBid } from "@/lib/services/ad-settings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Megaphone, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function AdvertisingPage() {
  const user = await requireBusinessOwner();
  const minimumDailyBid = await getMinimumDailyBid();

  const [campaigns, wallet] = await Promise.all([
    db.advertisingCampaign.findMany({
      where: { ownerId: user.id },
      include: {
        business: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.wallet.findUnique({ where: { userId: user.id } }),
  ]);

  const walletBalance = Number(wallet?.balance ?? 0);

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "accent"> = {
    ACTIVE: "default",
    DRAFT: "secondary",
    PENDING_APPROVAL: "accent",
    PAUSED: "secondary",
    REJECTED: "destructive",
    EXPIRED: "secondary",
    COMPLETED: "secondary",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Advertising</h1>
          <p className="text-muted mt-1">
            Bid per category from {formatCurrency(minimumDailyBid)}/day. Highest bids appear at the top of search results.
          </p>
        </div>
        <Link href="/dashboard/advertising/new">
          <Button variant="accent">
            <PlusCircle className="size-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      <Card className="border-buffalo-red/20 bg-soft-gray">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Wallet className="mt-0.5 size-5 text-buffalo-red" />
            <div>
              <p className="font-medium text-navy">Advertising wallet</p>
              <p className="text-sm text-muted">
                Balance: <span className="font-semibold text-navy">{formatCurrency(walletBalance)}</span>
                {" · "}Minimum bid: {formatCurrency(minimumDailyBid)}/day
              </p>
            </div>
          </div>
          <Link href="/dashboard/billing">
            <Button variant="outline" size="sm">Add Funds</Button>
          </Link>
        </CardContent>
      </Card>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Megaphone className="size-12 text-muted mx-auto mb-4" />
            <p className="text-muted mb-4">No campaigns yet. Promote your business to reach more customers.</p>
            <Link href="/dashboard/advertising/new">
              <Button variant="accent">Create Campaign</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-navy">{campaign.name}</h3>
                      <Badge variant={statusColors[campaign.status] ?? "secondary"}>
                        {campaign.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted mt-1">{campaign.business.name}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted">
                      <span>{campaign.impressions.toLocaleString()} impressions</span>
                      <span>{campaign.clicks.toLocaleString()} clicks</span>
                      <span>{formatCurrency(Number(campaign.dailyBid))}/day</span>
                    </div>
                  </div>
                  <Link href={`/dashboard/advertising/${campaign.id}`}>
                    <Button variant="outline" size="sm">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
