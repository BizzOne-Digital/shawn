import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}

function buildUrl(
  basePath: string,
  page: number,
  searchParams?: Record<string, string | undefined>
) {
  const params = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") params.set(key, value);
    }
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) =>
      p === 1 ||
      p === totalPages ||
      (p >= currentPage - 1 && p <= currentPage + 1)
  );

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2 px-2" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link
          href={buildUrl(basePath, currentPage - 1, searchParams)}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-2 text-sm hover:bg-soft-gray transition-colors sm:px-3"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-2 text-sm text-muted opacity-50 cursor-not-allowed sm:px-3">
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Previous</span>
        </span>
      )}

      <div className="flex flex-wrap items-center justify-center gap-1">
        {pages.map((page, index) => {
          const prevPage = pages[index - 1];
          const showEllipsis = prevPage && page - prevPage > 1;

          return (
            <span key={page} className="flex items-center gap-1">
              {showEllipsis && <span className="px-2 text-muted">…</span>}
              <Link
                href={buildUrl(basePath, page, searchParams)}
                className={cn(
                  "size-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
                  page === currentPage
                    ? "bg-navy text-white"
                    : "border border-border hover:bg-soft-gray"
                )}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </Link>
            </span>
          );
        })}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={buildUrl(basePath, currentPage + 1, searchParams)}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-2 text-sm hover:bg-soft-gray transition-colors sm:px-3"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-2 text-sm text-muted opacity-50 cursor-not-allowed sm:px-3">
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
