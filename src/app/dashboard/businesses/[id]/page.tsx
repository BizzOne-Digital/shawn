import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireBusinessOwner } from "@/lib/auth-utils";
import { SubmissionWizard } from "@/components/submission/submission-wizard";
import { DEFAULT_HOURS } from "@/lib/services/business-hours";
import { NOT_DELETED } from "@/lib/prisma-mongo-filters";
import { Badge } from "@/components/ui/badge";
import { getListingStatusLabel } from "@/lib/business-utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditBusinessPage({ params }: PageProps) {
  const user = await requireBusinessOwner();
  const { id } = await params;

  const business = await db.business.findFirst({
    where: { id, ownerId: user.id, ...NOT_DELETED },
    include: { hours: true, images: true, socialLinks: true },
  });

  if (!business) notFound();

  const categories = await db.category.findMany({
    where: { isActive: true },
    include: {
      subcategories: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });

  const initialData = {
    id: business.id,
    name: business.name,
    phone: business.phone ?? "",
    publicEmail: business.publicEmail ?? "",
    website: business.website ?? "",
    categoryId: business.categoryId ?? "",
    subcategoryId: business.subcategoryId ?? "",
    suggestedCategory: business.suggestedCategory ?? "",
    shortDescription: business.shortDescription ?? "",
    description: business.description ?? "",
    services: business.services,
    tags: business.tags,
    address: business.address ?? "",
    addressLine2: business.addressLine2 ?? "",
    city: business.city ?? "",
    state: business.state,
    zipCode: business.zipCode ?? "",
    socialLinks: business.socialLinks.map((s) => ({
      platform: s.platform,
      url: s.url,
    })),
    hours: business.hours.length > 0 ? business.hours : DEFAULT_HOURS,
    images: business.images.map((img) => ({
      url: img.url,
      publicId: img.publicId ?? undefined,
      type: img.type,
      alt: img.alt ?? undefined,
      sortOrder: img.sortOrder,
    })),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-navy">Edit Business</h1>
            <Badge variant="secondary">{getListingStatusLabel(business.status)}</Badge>
          </div>
          <p className="text-muted mt-1">{business.name}</p>
        </div>
        <Link href={`/dashboard/businesses/${id}/status`}>
          <Button variant="outline">View Status</Button>
        </Link>
      </div>
      <SubmissionWizard
        categories={categories}
        initialData={initialData}
        businessStatus={business.status}
      />
    </div>
  );
}
