import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BusinessCard } from "@/components/business/business-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BusinessItem {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  city?: string | null;
  phone?: string | null;
  isVerified?: boolean;
  isFeatured?: boolean;
  isOpen?: boolean;
  category?: { name: string } | null;
  images?: { url: string }[];
  isSponsored?: boolean;
}

interface BusinessSectionProps {
  title: string;
  subtitle?: string;
  businesses: BusinessItem[];
  showSponsoredLabel?: boolean;
  viewAllHref?: string;
}

export function BusinessSection({
  title,
  subtitle,
  businesses,
  showSponsoredLabel,
  viewAllHref,
}: BusinessSectionProps) {
  if (businesses.length === 0) return null;

  return (
    <section className="overflow-x-clip py-16 md:py-20">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-navy">
                {title}
              </h2>
              {showSponsoredLabel && (
                <Badge variant="outline" className="text-xs">
                  Sponsored
                </Badge>
              )}
            </div>
            {subtitle && <p className="mt-2 text-muted text-lg">{subtitle}</p>}
          </div>
          {viewAllHref && (
            <Link href={viewAllHref} className="hidden sm:block">
              <Button variant="ghost">
                View all
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={{
                ...business,
                imageUrl: business.images?.[0]?.url ?? null,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
