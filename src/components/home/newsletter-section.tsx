import { SectionHeading } from "@/components/shared/section-heading";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import type { PageContentMap } from "@/lib/content/page-content";
import { txt } from "@/lib/content/page-content";

interface NewsletterSectionProps {
  content: PageContentMap;
}

export function NewsletterSection({ content }: NewsletterSectionProps) {
  return (
    <section className="overflow-x-clip py-16 md:py-20">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <SectionHeading
            title={txt(content, "newsletter.title")}
            subtitle={txt(content, "newsletter.subtitle")}
          />
          <NewsletterForm variant="inline" className="max-w-md mx-auto" />
          <p className="text-xs text-muted mt-4">
            {txt(content, "newsletter.disclaimer")}
          </p>
        </div>
      </div>
    </section>
  );
}
