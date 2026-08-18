import { Suspense } from "react";
import type { Metadata } from "next";
import { getDirectoryBusinesses, getFilterOptions } from "@/lib/queries/business";
import { BusinessCard } from "@/components/business/business-card";
import { DirectoryFilters } from "@/components/directory/directory-filters";
import { Pagination } from "@/components/shared/pagination";
import { SectionHeading } from "@/components/shared/section-heading";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Business Directory",
  description:
    "Browse local businesses in Buffalo and Western New York. Filter by category, city, hours, and more.",
};

interface DirectoryPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const value = params[key];
  return typeof value === "string" ? value : undefined;
}

async function DirectoryResults({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const category = getParam(searchParams, "category");
  const subcategory = getParam(searchParams, "subcategory");
  const city = getParam(searchParams, "city");
  const openNow = getParam(searchParams, "openNow") === "true";
  const verified = getParam(searchParams, "verified") === "true";
  const featured = getParam(searchParams, "featured") === "true";
  const sort = (getParam(searchParams, "sort") as "name" | "newest" | "popular") ?? "newest";
  const view = getParam(searchParams, "view") === "list" ? "list" : "grid";
  const page = Math.max(1, parseInt(getParam(searchParams, "page") ?? "1", 10) || 1);

  let businesses: Awaited<ReturnType<typeof getDirectoryBusinesses>>["businesses"] = [];
  let total = 0;
  let totalPages = 0;
  let loadError = false;

  try {
    const result = await getDirectoryBusinesses({
      category,
      subcategory,
      city,
      openNow,
      verified,
      featured,
      sort,
      page,
      view,
    });
    businesses = result.businesses;
    total = result.total;
    totalPages = result.totalPages;
  } catch (error) {
    console.error("[DirectoryResults] Failed to load businesses:", error);
    loadError = true;
  }

  const filterParams = {
    category,
    subcategory,
    city,
    openNow: openNow ? "true" : undefined,
    verified: verified ? "true" : undefined,
    featured: featured ? "true" : undefined,
    sort,
    view,
  };

  if (loadError) {
    return (
      <div className="rounded-xl border border-border bg-soft-gray py-16 text-center">
        <h3 className="font-display text-xl font-semibold text-navy">
          Unable to load directory
        </h3>
        <p className="text-muted mt-2">
          Please refresh the page. If this continues, check that the database is connected.
        </p>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="font-display text-xl font-semibold text-navy">
          No businesses found
        </h3>
        <p className="text-muted mt-2">
          Try adjusting your filters or browse all listings.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-muted mb-6">
        Showing {businesses.length} of {total} businesses
      </p>
      <div
        className={
          view === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
        }
      >
        {businesses.map((business) => (
          <BusinessCard key={business.id} business={business} variant={view} />
        ))}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/directory"
        searchParams={filterParams}
      />
    </>
  );
}

export default async function DirectoryPage({ searchParams }: DirectoryPageProps) {
  const params = await searchParams;
  let filterOptions = { categories: [] as Awaited<ReturnType<typeof getFilterOptions>>["categories"], cities: [] as string[] };

  try {
    filterOptions = await getFilterOptions();
  } catch (error) {
    console.error("Directory page filter load failed:", error);
  }

  const current = {
    category: getParam(params, "category"),
    subcategory: getParam(params, "subcategory"),
    city: getParam(params, "city"),
    openNow: getParam(params, "openNow") === "true",
    verified: getParam(params, "verified") === "true",
    featured: getParam(params, "featured") === "true",
    sort: getParam(params, "sort") ?? "newest",
    view: getParam(params, "view") ?? "grid",
  };

  return (
    <div className="overflow-x-clip py-12 md:py-16">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Business Directory"
          subtitle="Explore local businesses across Buffalo, Amherst, Cheektowaga, and all of Western New York"
          align="left"
          className="mb-8"
        />

        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="min-w-0">
            <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
              <DirectoryFilters
                categories={filterOptions.categories}
                cities={filterOptions.cities}
                current={current}
              />
            </Suspense>
          </aside>

          <div className="min-w-0">
            <Suspense
              fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-xl" />
                  ))}
                </div>
              }
            >
              <DirectoryResults searchParams={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
