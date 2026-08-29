import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { BusinessListingTier } from "@prisma/client";
import { isProListingTier } from "@/lib/services/listing-tier";
import {
  MapPin,
  Phone,
  Globe,
  Mail,
  BadgeCheck,
  Clock,
  ExternalLink,
} from "lucide-react";
import { getBusinessBySlug, getRelatedBusinesses } from "@/lib/queries/business";
import { formatHours, isOpenNow, getOpenStatusLabel } from "@/lib/services/business-hours";
import { BusinessCard } from "@/components/business/business-card";
import { resolveImageUrl } from "@/lib/utils/image-url";
import { BusinessEnquiryForm } from "@/components/forms/business-enquiry-form";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { absoluteUrl, formatPhone, truncate } from "@/lib/utils";

interface BusinessPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BusinessPageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    return { title: "Business Not Found" };
  }

  const description =
    business.shortDescription ??
    truncate(business.description ?? "", 160) ??
    `${business.name} — local business in ${business.city ?? "Buffalo"}, NY`;

  return {
    title: business.name,
    description,
    openGraph: {
      title: business.name,
      description,
      type: "website",
      url: absoluteUrl(`/business/${business.slug}`),
    },
  };
}

function buildJsonLd(business: NonNullable<Awaited<ReturnType<typeof getBusinessBySlug>>>) {
  const logo = business.images.find((img) => img.type === "LOGO");
  const gallery = business.images.filter((img) => img.type === "GALLERY");

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.description ?? business.shortDescription,
    url: business.website ?? absoluteUrl(`/business/${business.slug}`),
    telephone: business.phone,
    email: business.publicEmail,
    image: gallery.length > 0 ? gallery.map((img) => img.url) : logo?.url,
    address: business.address
      ? {
          "@type": "PostalAddress",
          streetAddress: business.address,
          addressLocality: business.city,
          addressRegion: business.state,
          postalCode: business.zipCode,
          addressCountry: "US",
        }
      : undefined,
    geo:
      business.latitude && business.longitude
        ? {
            "@type": "GeoCoordinates",
            latitude: business.latitude,
            longitude: business.longitude,
          }
        : undefined,
    openingHoursSpecification: business.hours
      .filter((h) => !h.isClosed)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.dayOfWeek,
        opens: h.is24Hours ? "00:00" : h.openTime,
        closes: h.is24Hours ? "23:59" : h.closeTime,
      })),
  };
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);

  if (!business) notFound();

  const isPro = isProListingTier(business.listingTier);
  const related = isPro
    ? await getRelatedBusinesses(business.id, business.categoryId, 4)
    : [];

  const open = isOpenNow(business.hours);
  const hoursFormatted = formatHours(business.hours);
  const logo = business.images.find((img) => img.type === "LOGO");
  const cover = business.images.find((img) => img.type === "COVER");
  const gallery = business.images.filter((img) => img.type === "GALLERY");
  const jsonLd = buildJsonLd(business);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="overflow-x-clip pb-16">
        {/* Cover / header */}
        <div className={`h-48 md:h-64 bg-gradient-to-br from-navy/10 to-navy/5 relative ${!isPro ? "h-24 md:h-28" : ""}`}>
          {isPro && cover && (
            <img
              src={resolveImageUrl(cover.url)}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
          )}
        </div>

        <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
          <div className={`relative flex flex-col md:flex-row gap-6 items-start ${isPro ? "-mt-16 md:-mt-20" : "mt-6"}`}>
            {isPro && (
            <div className="size-28 md:size-32 rounded-xl border-4 border-white bg-white shadow-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
              {logo ? (
                <img src={resolveImageUrl(logo.url)} alt={business.name} className="size-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-navy/30 font-display">
                  {business.name[0]}
                </span>
              )}
            </div>
            )}

            <div className={`flex-1 ${isPro ? "pt-2 md:pt-8" : ""}`}>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-navy">
                  {business.name}
                </h1>
                {business.isVerified && (
                  <BadgeCheck className="size-6 text-light-blue" aria-label="Verified" />
                )}
                {business.isFeatured && <Badge variant="accent">Featured</Badge>}
              </div>

              {business.category && (
                <Link
                  href={`/categories/${business.category.slug}`}
                  className="text-muted hover:text-buffalo-red mt-1 inline-block"
                >
                  {business.category.name}
                  {business.subcategory && ` · ${business.subcategory.name}`}
                </Link>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                {isPro && (
                <span
                  className={`flex items-center gap-1.5 font-medium ${open ? "text-green-600" : "text-muted"}`}
                >
                  <Clock className="size-4" />
                  {getOpenStatusLabel(business.hours)}
                </span>
                )}
                {business.city && (
                  <span className="flex items-center gap-1.5 text-muted">
                    <MapPin className="size-4" />
                    {business.city}, {business.state}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mt-10">
            <div className="lg:col-span-2 space-y-8">
              {isPro && business.shortDescription && (
                <p className="text-lg text-muted leading-relaxed">
                  {business.shortDescription}
                </p>
              )}

              {isPro && business.description && (
                <section>
                  <h2 className="font-display text-2xl font-semibold text-navy mb-4">
                    About
                  </h2>
                  <div className="prose prose-sm max-w-none break-words text-muted leading-relaxed whitespace-pre-line">
                    {business.description}
                  </div>
                </section>
              )}

              {isPro && business.services.length > 0 && (
                <section>
                  <h2 className="font-display text-2xl font-semibold text-navy mb-4">
                    Services
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {business.services.map((service) => (
                      <Badge key={service} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {isPro && gallery.length > 0 && (
                <section>
                  <h2 className="font-display text-2xl font-semibold text-navy mb-4">
                    Gallery
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {gallery.map((img) => (
                      <div
                        key={img.id}
                        className="aspect-square rounded-lg overflow-hidden bg-soft-gray"
                      >
                        <img
                          src={resolveImageUrl(img.url)}
                          alt={img.alt ?? business.name}
                          className="size-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {isPro && (business.couponText || business.discountCode) && (
                <section>
                  <h2 className="font-display text-2xl font-semibold text-navy mb-4">
                    Offers
                  </h2>
                  {business.couponText && (
                    <p className="text-muted leading-relaxed">{business.couponText}</p>
                  )}
                  {business.discountCode && (
                    <p className="mt-2 font-mono text-lg font-semibold text-buffalo-red">
                      Code: {business.discountCode}
                    </p>
                  )}
                </section>
              )}

              {isPro && business.lgbEmail && (
                <section>
                  <h2 className="font-display text-2xl font-semibold text-navy mb-2">
                    LetsGoBuffalo Email
                  </h2>
                  <a href={`mailto:${business.lgbEmail}`} className="text-buffalo-red hover:underline">
                    {business.lgbEmail}
                  </a>
                </section>
              )}

              {/* Location */}
              <section>
                <h2 className="font-display text-2xl font-semibold text-navy mb-4">
                  Location
                </h2>
                <div className="map-grid rounded-xl border border-border h-64 flex items-center justify-center bg-soft-gray relative overflow-hidden">
                  <div className="text-center z-10">
                    <MapPin className="size-8 text-navy/40 mx-auto mb-2" />
                    {business.address && (
                      <p className="text-sm text-muted">
                        {business.address}
                        {business.addressLine2 && `, ${business.addressLine2}`}
                        <br />
                        {business.city}, {business.state} {business.zipCode}
                      </p>
                    )}
                    {!business.address && business.city && (
                      <p className="text-sm text-muted">
                        {business.city}, {business.state}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {business.phone && (
                    <a
                      href={`tel:${business.phone.replace(/\D/g, "")}`}
                      className="flex items-center gap-3 text-sm hover:text-buffalo-red transition-colors"
                    >
                      <Phone className="size-4 text-buffalo-red flex-shrink-0" />
                      {formatPhone(business.phone)}
                    </a>
                  )}
                  {business.publicEmail && isPro && (
                    <a
                      href={`mailto:${business.publicEmail}`}
                      className="flex items-center gap-3 text-sm hover:text-buffalo-red transition-colors break-all"
                    >
                      <Mail className="size-4 text-buffalo-red flex-shrink-0" />
                      {business.publicEmail}
                    </a>
                  )}
                  {business.website && (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm hover:text-buffalo-red transition-colors break-all"
                    >
                      <Globe className="size-4 text-buffalo-red flex-shrink-0" />
                      Visit website
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                  {business.address && (
                    <div className="flex items-start gap-3 text-sm text-muted">
                      <MapPin className="size-4 text-buffalo-red flex-shrink-0 mt-0.5" />
                      <span>
                        {business.address}
                        {business.addressLine2 && `, ${business.addressLine2}`}
                        <br />
                        {business.city}, {business.state} {business.zipCode}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {isPro && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {hoursFormatted.map((row) => (
                      <li key={row.day} className="flex justify-between gap-4">
                        <span className="text-muted">{row.day}</span>
                        <span className="font-medium">{row.hours}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              )}

              {isPro && business.socialLinks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Social</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {business.socialLinks.map((link) => (
                      <a
                        key={link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm hover:text-buffalo-red transition-colors capitalize"
                      >
                        <ExternalLink className="size-3.5" />
                        {link.platform.toLowerCase()}
                      </a>
                    ))}
                  </CardContent>
                </Card>
              )}

              {isPro && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Send a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <BusinessEnquiryForm
                    businessId={business.id}
                    businessName={business.name}
                  />
                </CardContent>
              </Card>
              )}
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-16">
              <Separator className="mb-10" />
              <SectionHeading
                title="Related Businesses"
                subtitle={`More ${business.category?.name ?? "local"} businesses in Western New York`}
                align="left"
                className="mb-8"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((b) => (
                  <BusinessCard key={b.id} business={b} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
