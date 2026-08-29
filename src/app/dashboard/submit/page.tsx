import { BusinessListingTier } from "@prisma/client";
import { db } from "@/lib/db";
import { requireBusinessOwner } from "@/lib/auth-utils";
import { SubmissionWizard } from "@/components/submission/submission-wizard";
import { DEFAULT_HOURS } from "@/lib/services/business-hours";
import { NOT_DELETED } from "@/lib/prisma-mongo-filters";

export default async function SubmitBusinessPage({
  searchParams,
}: {
  searchParams: Promise<{ draft?: string }>;
}) {
  await requireBusinessOwner();
  const params = await searchParams;

  const categories = await db.category.findMany({
    where: { isActive: true },
    include: {
      subcategories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  let initialData;
  let draftStatus: string | undefined;
  let listingTier: BusinessListingTier = BusinessListingTier.FREE_BASIC;

  if (params.draft) {
    const user = await requireBusinessOwner();
    const draft = await db.business.findFirst({
      where: {
        id: params.draft,
        ownerId: user.id,
        status: { in: ["DRAFT", "CHANGES_REQUESTED"] },
        ...NOT_DELETED,
      },
      include: { hours: true, images: true, socialLinks: true },
    });
    if (draft) {
      draftStatus = draft.status;
      listingTier = draft.listingTier;
      initialData = {
        id: draft.id,
        name: draft.name,
        phone: draft.phone ?? "",
        publicEmail: draft.publicEmail ?? "",
        website: draft.website ?? "",
        categoryId: draft.categoryId ?? "",
        subcategoryId: draft.subcategoryId ?? "",
        suggestedCategory: draft.suggestedCategory ?? "",
        shortDescription: draft.shortDescription ?? "",
        description: draft.description ?? "",
        services: draft.services,
        tags: draft.tags,
        address: draft.address ?? "",
        addressLine2: draft.addressLine2 ?? "",
        city: draft.city ?? "",
        state: draft.state,
        zipCode: draft.zipCode ?? "",
        socialLinks: draft.socialLinks.map((s) => ({
          platform: s.platform,
          url: s.url,
        })),
        hours: draft.hours.length > 0 ? draft.hours : DEFAULT_HOURS,
        images: draft.images.map((img) => ({
          url: img.url,
          publicId: img.publicId ?? undefined,
          type: img.type,
          alt: img.alt ?? undefined,
          sortOrder: img.sortOrder,
        })),
        couponText: draft.couponText ?? "",
        discountCode: draft.discountCode ?? "",
        lgbEmail: draft.lgbEmail?.replace(/@LetsGoBuffalo\.com$/i, "") ?? "",
        videoUrl: draft.videoUrl ?? "",
        searchKeywords: draft.searchKeywords ?? [],
      };
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">List Your Business</h1>
        <p className="text-muted mt-1">
          {listingTier === BusinessListingTier.PRO || listingTier === BusinessListingTier.SELLER
            ? "Complete all steps for your Pro listing"
            : "Free Basic listing: company name, address, phone, and website"}
        </p>
      </div>
      <SubmissionWizard
        categories={categories}
        initialData={initialData}
        businessStatus={draftStatus}
        listingTier={listingTier}
      />
    </div>
  );
}
