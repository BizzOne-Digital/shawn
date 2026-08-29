import Image from "next/image";
import type { BusinessHour, BusinessImage, SocialLink, Category, Subcategory } from "@prisma/client";
import { formatHours } from "@/lib/services/business-hours";
import { resolveImageUrl } from "@/lib/utils/image-url";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReviewBusiness = {
  name: string;
  phone: string | null;
  publicEmail: string | null;
  website: string | null;
  shortDescription: string | null;
  description: string | null;
  services: string[];
  tags: string[];
  address: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string;
  zipCode: string | null;
  suggestedCategory: string | null;
  category: Pick<Category, "name"> | null;
  subcategory: Pick<Subcategory, "name"> | null;
  hours: BusinessHour[];
  images: BusinessImage[];
  socialLinks: SocialLink[];
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">{children}</CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted">{label}</p>
      <p className="font-medium mt-0.5 whitespace-pre-wrap">{value || "—"}</p>
    </div>
  );
}

export function BusinessSubmissionReview({ business }: { business: ReviewBusiness }) {
  const hours = business.hours.map((hour) => ({
    dayOfWeek: hour.dayOfWeek,
    openTime: hour.openTime,
    closeTime: hour.closeTime,
    isClosed: hour.isClosed,
    is24Hours: hour.is24Hours,
  }));

  return (
    <div className="space-y-4">
      <Section title="1. Basic Info">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business name" value={business.name} />
          <Field label="Phone" value={business.phone ?? ""} />
          <Field label="Public email" value={business.publicEmail ?? ""} />
          <Field label="Website" value={business.website ?? ""} />
        </div>
      </Section>

      <Section title="2. Category">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" value={business.category?.name ?? ""} />
          <Field label="Subcategory" value={business.subcategory?.name ?? ""} />
          <Field label="Suggested category" value={business.suggestedCategory ?? ""} />
        </div>
      </Section>

      <Section title="3. Description">
        <div className="space-y-4">
          <Field label="Short description" value={business.shortDescription ?? ""} />
          <Field label="Full description" value={business.description ?? ""} />
          <Field label="Services" value={business.services.join(", ")} />
          <Field label="Tags" value={business.tags.join(", ")} />
        </div>
      </Section>

      <Section title="4. Location">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Address"
            value={[business.address, business.addressLine2].filter(Boolean).join(", ")}
          />
          <Field
            label="City / State / ZIP"
            value={[business.city, business.state, business.zipCode].filter(Boolean).join(", ")}
          />
        </div>
      </Section>

      <Section title="5. Social Media">
        {business.socialLinks.length === 0 ? (
          <p className="text-muted">No social links provided.</p>
        ) : (
          <ul className="space-y-2">
            {business.socialLinks.map((link) => (
              <li key={link.id}>
                <span className="text-muted">{link.platform}: </span>
                <a href={link.url} className="font-medium text-navy hover:text-buffalo-red" target="_blank" rel="noreferrer">
                  {link.url}
                </a>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="6. Hours">
        <dl className="grid gap-2 sm:grid-cols-2">
          {formatHours(hours).map((row) => (
            <div key={row.day} className="flex justify-between gap-4 border-b border-border/60 pb-2">
              <dt className="text-muted">{row.day}</dt>
              <dd className="font-medium">{row.hours}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="7. Images">
        {business.images.length === 0 ? (
          <p className="text-muted">No images uploaded.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {business.images.map((image) => (
              <div key={image.id} className="space-y-1">
                <div className="relative aspect-square overflow-hidden rounded-lg border border-border">
                  <Image
                    src={resolveImageUrl(image.url)}
                    alt={image.alt ?? image.type}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 200px"
                    unoptimized={image.url.startsWith("/api/uploads/")}
                  />
                </div>
                <p className="text-xs text-muted">{image.type}</p>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
