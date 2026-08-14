import Link from "next/link";
import { MapPin, Phone, Globe, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HighlightText } from "@/components/search/highlight-text";
import type { SearchResultItem } from "@/lib/services/search";

interface SearchResultCardProps {
  result: SearchResultItem;
  query: string;
}

export function SearchResultCard({ result, query }: SearchResultCardProps) {
  const description = result.shortDescription ?? result.description ?? "";

  return (
    <Card
      className={
        result.isSponsored
          ? "border-buffalo-red/30 bg-buffalo-red/[0.02]"
          : "hover:shadow-md transition-shadow"
      }
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {result.isSponsored && (
              <Badge variant="outline" className="mb-2 text-xs text-muted">
                Ad
              </Badge>
            )}
            <Link
              href={`/business/${result.slug}`}
              className="text-xl text-navy hover:text-buffalo-red hover:underline font-semibold"
            >
              <HighlightText text={result.name} query={query} />
            </Link>
            {result.category && (
              <p className="text-sm text-muted mt-1">{result.category.name}</p>
            )}
            {description && (
              <p className="text-sm text-muted mt-2 line-clamp-2">
                <HighlightText text={description} query={query} />
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted">
              {result.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {result.city}, NY
                </span>
              )}
              {result.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="size-3.5" />
                  {result.phone}
                </span>
              )}
              {result.website && (
                <span className="flex items-center gap-1">
                  <Globe className="size-3.5" />
                  Website
                </span>
              )}
              {result.isVerified && (
                <span className="flex items-center gap-1 text-light-blue">
                  <BadgeCheck className="size-3.5" />
                  Verified
                </span>
              )}
              {result.isOpen !== undefined && (
                <span className={result.isOpen ? "text-green-600" : ""}>
                  {result.isOpen ? "Open now" : "Closed"}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
