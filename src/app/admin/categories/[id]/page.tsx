import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { CategoryEditForm } from "@/components/admin/category-edit-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CategoryEditPage({ params }: Props) {
  const { id } = await params;

  const category = await db.category.findUnique({
    where: { id },
    include: {
      subcategories: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!category) notFound();

  return (
    <div>
      <PageHeader title={`Edit: ${category.name}`}>
        <Button variant="outline" asChild>
          <Link href="/admin/categories">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </PageHeader>

      <CategoryEditForm
        category={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          icon: category.icon ?? "",
          sortOrder: category.sortOrder,
          isActive: category.isActive,
          seoTitle: category.seoTitle ?? "",
          seoDescription: category.seoDescription ?? "",
        }}
        subcategories={category.subcategories}
      />
    </div>
  );
}
