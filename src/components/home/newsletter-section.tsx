import { SectionHeading } from "@/components/shared/section-heading";
import { NewsletterForm } from "@/components/forms/newsletter-form";

export function NewsletterSection() {
  return (
    <section className="overflow-x-clip py-16 md:py-20">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <SectionHeading
            title="Stay in the Herd"
            subtitle="Get weekly picks for new Buffalo businesses, seasonal guides, and local deals delivered to your inbox"
          />
          <NewsletterForm variant="inline" className="max-w-md mx-auto" />
          <p className="text-xs text-muted mt-4">
            No spam — just good stuff from the 716. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
