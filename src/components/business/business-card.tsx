"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Clock, MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HoverScale } from "@/components/ui/motion";
import { cn, truncate } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/utils/image-url";

export interface BusinessCardData {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  city?: string | null;
  isVerified?: boolean;
  isFeatured?: boolean;
  isOpen?: boolean;
  imageUrl?: string | null;
  category?: { name: string; slug?: string } | null;
}

interface BusinessCardProps {
  business: BusinessCardData;
  variant?: "grid" | "list";
  className?: string;
}

export function BusinessCard({
  business,
  variant = "grid",
  className,
}: BusinessCardProps) {
  const {
    name,
    slug,
    shortDescription,
    city,
    isVerified,
    isFeatured,
    isOpen,
    imageUrl,
    category,
  } = business;

  const imageSrc = resolveImageUrl(imageUrl);
  const description = shortDescription
    ? truncate(shortDescription, variant === "list" ? 180 : 100)
    : null;

  if (variant === "list") {
    return (
      <HoverScale className={cn("h-full", className)}>
        <Link href={`/business/${slug}`} className="block h-full">
          <Card className="group h-full overflow-hidden transition-shadow hover:shadow-md">
            <div className="flex flex-col sm:flex-row">
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-soft-gray sm:aspect-auto sm:h-auto sm:w-56">
                <Image
                  src={imageSrc}
                  alt={name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 224px"
                  unoptimized={imageSrc.startsWith("/api/uploads/")}
                />
                {isFeatured && (
                  <Badge
                    variant="destructive"
                    className="absolute left-3 top-3 gap-1 shadow-sm"
                  >
                    <Star className="size-3 fill-current" />
                    Featured
                  </Badge>
                )}
              </div>
              <CardContent className="flex flex-1 flex-col justify-center p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {category && (
                    <Badge variant="secondary">{category.name}</Badge>
                  )}
                  {isVerified && (
                    <Badge variant="accent" className="gap-1">
                      <BadgeCheck className="size-3" />
                      Verified
                    </Badge>
                  )}
                  {isOpen !== undefined && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium",
                        isOpen ? "text-green-600" : "text-muted"
                      )}
                    >
                      <Clock className="size-3" />
                      {isOpen ? "Open now" : "Closed"}
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-display text-xl font-semibold text-navy group-hover:text-buffalo-red">
                  {name}
                </h3>
                {city && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                    <MapPin className="size-3.5 shrink-0" />
                    {city}
                  </p>
                )}
                {description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {description}
                  </p>
                )}
              </CardContent>
            </div>
          </Card>
        </Link>
      </HoverScale>
    );
  }

  return (
    <HoverScale className={cn("h-full", className)}>
      <Link href={`/business/${slug}`} className="block h-full">
        <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
          <div className="relative aspect-[4/3] overflow-hidden bg-soft-gray">
            <Image
              src={imageSrc}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={imageSrc.startsWith("/api/uploads/")}
            />
            <div className="absolute inset-x-0 top-0 flex flex-wrap gap-2 p-3">
              {isFeatured && (
                <Badge variant="destructive" className="gap-1 shadow-sm">
                  <Star className="size-3 fill-current" />
                  Featured
                </Badge>
              )}
              {isVerified && (
                <Badge className="gap-1 bg-white/95 text-navy shadow-sm hover:bg-white">
                  <BadgeCheck className="size-3 text-buffalo-red" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {category && (
                  <Badge variant="secondary" className="mb-2">
                    {category.name}
                  </Badge>
                )}
                <h3 className="truncate font-display text-lg font-semibold text-navy group-hover:text-buffalo-red">
                  {name}
                </h3>
                {city && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                    <MapPin className="size-3.5 shrink-0" />
                    {city}
                  </p>
                )}
              </div>
              {isOpen !== undefined && (
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                    isOpen
                      ? "bg-green-100 text-green-700"
                      : "bg-soft-gray text-muted"
                  )}
                >
                  {isOpen ? "Open" : "Closed"}
                </span>
              )}
            </div>
            {description && (
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">
                {description}
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </HoverScale>
  );
}
