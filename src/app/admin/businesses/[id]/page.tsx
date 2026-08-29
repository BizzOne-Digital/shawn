import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { BusinessEditForm } from "@/components/admin/business-edit-form";
import { ListingStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
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
        owner: { select: { name: true, email: true } },
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
