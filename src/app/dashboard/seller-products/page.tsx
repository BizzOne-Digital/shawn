import { BusinessListingTier } from "@prisma/client";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireBusinessOwner } from "@/lib/auth-utils";
import { NOT_DELETED } from "@/lib/prisma-mongo-filters";
import { SellerProductsManager } from "@/components/dashboard/seller-products-manager";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function SellerProductsPage() {
  const user = await requireBusinessOwner();

  const businesses = await db.business.findMany({
    where: {
      ownerId: user.id,
      listingTier: BusinessListingTier.SELLER,
      ...NOT_DELETED,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/businesses" className="inline-flex items-center gap-2 text-sm text-muted hover:text-navy mb-4">
          <ArrowLeft className="size-4" />
          Back to My Businesses
        </Link>
        <h1 className="font-display text-3xl font-bold text-navy">Seller Products</h1>
        <p className="text-muted mt-1">
          Add product images with links for your Seller listings (up to 10 per business).
        </p>
      </div>

      {businesses.length === 0 ? (
        <div className="rounded-xl border border-border bg-soft-gray p-8 text-center">
          <p className="text-muted">
            You need a Seller-tier business listing to manage products. Upgrade or contact support.
          </p>
          <Link href="/dashboard/subscribe?plan=business-seller" className="inline-block mt-4">
            <Button variant="accent">View Seller Plan</Button>
          </Link>
        </div>
      ) : (
        businesses.map((business) => (
          <SellerProductsManager key={business.id} businessId={business.id} businessName={business.name} />
        ))
      )}
    </div>
  );
}
