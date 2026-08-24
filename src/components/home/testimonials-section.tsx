import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import type { PageContentMap } from "@/lib/content/page-content";
import { txt } from "@/lib/content/page-content";

interface TestimonialsSectionProps {
  content: PageContentMap;
}

export function TestimonialsSection({ content }: TestimonialsSectionProps) {
  const testimonials = [0, 1, 2].map((index) => ({
    quote: txt(content, `testimonials.item_${index}.quote`),
    name: txt(content, `testimonials.item_${index}.name`),
    business: txt(content, `testimonials.item_${index}.business`),
  }));

  return (
    <section className="overflow-x-clip py-16 md:py-20 bg-soft-gray">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={txt(content, "testimonials.title")}
          subtitle={txt(content, "testimonials.subtitle")}
        />
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <Card key={t.name} className="bg-white">
              <CardContent className="p-6">
                <p className="text-muted leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="font-semibold text-navy">{t.name}</p>
                  <p className="text-sm text-muted">{t.business}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
