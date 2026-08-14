import Link from "next/link";
import { db } from "@/lib/db";
import { ListingStatus } from "@prisma/client";
import { PageHeader } from "@/components/admin/page-header";
import { BusinessEditForm } from "@/components/admin/business-edit-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function NewBusinessPage() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      subcategories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return (
    <div>
      <PageHeader title="Create Business" description="Manually add a new business listing">
        <Button variant="outline" asChild>
          <Link href="/admin/businesses">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </PageHeader>

      <BusinessEditForm
        action="create"
        categories={categories}
        business={{
          name: "",
          slug: "",
          description: "",
          shortDescription: "",
          status: ListingStatus.DRAFT,
          address: "",
          city: "Buffalo",
          state: "NY",
          zipCode: "",
          phone: "",
          publicEmail: "",
          website: "",
          isVerified: false,
          isFeatured: false,
          categoryId: "",
          subcategoryId: "",
        }}
      />
    </div>
  );
}
