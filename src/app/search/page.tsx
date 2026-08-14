import Link from "next/link";
import type { Metadata } from "next";
import { searchBusinesses } from "@/lib/services/search";
import { getRecentBusinesses } from "@/lib/queries/business";
import { SearchBar } from "@/components/search/search-bar";
import { SearchResultCard } from "@/components/search/search-result-card";
import { BusinessCard } from "@/components/business/business-card";
import { Pagination } from "@/components/shared/pagination";
import { SectionHeading } from "@/components/shared/section-heading";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const value = params[key];
  return typeof value === "string" ? value : undefined;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const q = getParam(params, "q");

  if (q) {
    return {
      title: `Search: ${q}`,
      description: `Search results for "${q}" in Buffalo and Western New York.`,
    };
  }

  return {
    title: "Search",
    description: "Search local businesses in Buffalo and Western New York.",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = getParam(params, "q") ?? "";
  const city = getParam(params, "city");
  const category = getParam(params, "category");
  const page = Math.max(1, parseInt(getParam(params, "page") ?? "1", 10) || 1);

  const hasQuery = q.trim().length > 0;

  const [results, recommendations] = await Promise.all([
    hasQuery
      ? searchBusinesses({ q, page, limit: 10, city, category })
      : Promise.resolve(null),
    getRecentBusinesses(6),
  ]);

  const filterParams = { q, city, category };

  return (
    <div className="overflow-x-clip py-12 md:py-16">
      <div className="mx-auto max-w-3xl min-w-0 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Search Buffalo Businesses"
          subtitle="Find restaurants, services, shops, and more across Western New York"
          className="mb-8"
        />
        <SearchBar
          defaultQuery={q}
          defaultCity={city ?? "All Locations"}
          className="mb-10"
        />

        {!hasQuery && (
          <div className="text-center py-12 text-muted">
            <p className="text-lg">Enter a search term to find local businesses.</p>
            <p className="mt-2 text-sm">
              Try &quot;wing sauce supplier,&quot; &quot;Elmwood coffee,&quot; or &quot;Amherst dentist&quot;
            </p>
          </div>
        )}

        {hasQuery && results && (
          <>
            <p className="text-sm text-muted mb-6">
              About {results.total + results.sponsored.length} results for &quot;{q}&quot;
              {city && ` in ${city}`}
            </p>

            {results.sponsored.length > 0 && (
              <div className="space-y-4 mb-8">
                {results.sponsored.map((result) => (
                  <SearchResultCard key={result.id} result={result} query={q} />
                ))}
              </div>
            )}

            {results.organic.length > 0 ? (
              <div className="space-y-4">
                {results.organic.map((result) => (
                  <SearchResultCard key={result.id} result={result} query={q} />
                ))}
              </div>
            ) : results.sponsored.length === 0 ? (
              <div className="text-center py-12 bg-soft-gray rounded-xl">
                <h3 className="font-display text-xl font-semibold text-navy">
                  No results for &quot;{q}&quot;
                </h3>
                <p className="text-muted mt-2 max-w-md mx-auto">
                  We couldn&apos;t find any businesses matching your search. Try different
                  keywords or browse our recommendations below.
                </p>
                {results.suggestions.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm text-muted mb-3">Try searching for:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {results.suggestions.map((suggestion) => (
                        <Link
                          key={suggestion}
                          href={`/search?q=${encodeURIComponent(suggestion)}`}
                          className="px-3 py-1.5 bg-white rounded-full text-sm border border-border hover:border-navy transition-colors"
                        >
                          {suggestion}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {results.totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={results.totalPages}
                basePath="/search"
                searchParams={filterParams}
              />
            )}
          </>
        )}

        {(!hasQuery || (results && results.organic.length === 0 && results.sponsored.length === 0)) && (
          <section className="mt-12">
            <h3 className="font-display text-2xl font-semibold text-navy mb-6">
              {hasQuery ? "You might also like" : "Recently added in Buffalo"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.map((business) => (
                <BusinessCard key={business.id} business={business} variant="list" />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
