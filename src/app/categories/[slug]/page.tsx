import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug, getBusinessesByCategory } from "@/lib/queries/business";
import { BusinessCard } from "@/components/business/business-card";
import { Pagination } from "@/components/shared/pagination";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "Category Not Found" };
  }

  return {
    title: category.seoTitle ?? category.name,
    description:
      category.seoDescription ??
      `Find ${category.name} businesses in Buffalo and Western New York on Let's Go Buffalo.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { businesses, total, totalPages } = await getBusinessesByCategory(slug, page);

  return (
    <div className="overflow-x-clip py-12 md:py-16">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={category.name}
          subtitle={
            category.description ??
            `Browse ${category.name.toLowerCase()} businesses across Buffalo and Western New York`
          }
          align="left"
          className="mb-4"
        />

        {category.subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {category.subcategories.map((sub) => (
              <Badge key={sub.slug} variant="secondary">
                {sub.name}
              </Badge>
            ))}
          </div>
        )}

        <p className="text-sm text-muted mb-6">
          {total} {total === 1 ? "business" : "businesses"} in this category
        </p>

        {businesses.length === 0 ? (
          <div className="text-center py-16 bg-soft-gray rounded-xl">
            <h3 className="font-display text-xl font-semibold text-navy">
              No businesses yet
            </h3>
            <p className="text-muted mt-2">
              Be the first {category.name.toLowerCase()} business listed in this category.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath={`/categories/${slug}`}
            />
          </>
        )}
      </div>
    </div>
  );
}
