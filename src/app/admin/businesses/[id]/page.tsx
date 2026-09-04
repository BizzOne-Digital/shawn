import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { BusinessEditForm } from "@/components/admin/business-edit-form";
import { ListingStatusBadge } from "@/components/admin/status-badge";
import { WalletCreditForm } from "@/components/admin/wallet-credit-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BusinessEditPage({ params }: Props) {
  const { id } = await params;

  const [business, categories] = await Promise.all([
    db.business.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            wallet: { select: { balance: true } },
          },
        },
        images: { orderBy: { sortOrder: "asc" } },
      },
    }),
    db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
  ]);

  if (!business) notFound();

  const walletBalance = Number(business.owner.wallet?.balance ?? 0);

  return (
    <div>
      <PageHeader title={`Edit: ${business.name}`} description={`Owner: ${business.owner.email}`}>
        <ListingStatusBadge status={business.status} />
        <Button variant="outline" asChild>
          <Link href="/admin/businesses">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </PageHeader>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Advertising Wallet</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted">
                Add funds for this business owner to use on per-category bids (minimum $0.25/day per
                category).
              </p>
              <p className="mt-2 text-2xl font-bold text-navy">{formatCurrency(walletBalance)}</p>
            </div>
            <WalletCreditForm
              userId={business.owner.id}
              userName={business.owner.name}
              userEmail={business.owner.email}
              currentBalance={walletBalance}
              defaultNote={`Advertising wallet credit for ${business.name}`}
              triggerLabel="Add Advertising Funds"
            />
          </CardContent>
        </Card>
      </div>

      <BusinessEditForm
        action="update"
        businessId={business.id}
        categories={categories}
        business={{
          name: business.name,
          slug: business.slug,
          description: business.description ?? "",
          shortDescription: business.shortDescription ?? "",
          status: business.status,
          address: business.address ?? "",
          city: business.city ?? "",
          state: business.state,
          zipCode: business.zipCode ?? "",
          phone: business.phone ?? "",
          publicEmail: business.publicEmail ?? "",
          website: business.website ?? "",
          isVerified: business.isVerified,
          isFeatured: business.isFeatured,
          categoryId: business.categoryId ?? "",
          subcategoryId: business.subcategoryId ?? "",
          listingTier: business.listingTier,
        }}
        initialImages={business.images.map((img) => ({
          url: img.url,
          publicId: img.publicId ?? undefined,
          type: img.type,
          alt: img.alt ?? undefined,
          sortOrder: img.sortOrder,
        }))}
      />
    </div>
  );
}
