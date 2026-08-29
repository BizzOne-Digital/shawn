import { BadgeCheck, MapPin, Megaphone, Shield } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import type { PageContentMap } from "@/lib/content/page-content";
import { txt } from "@/lib/content/page-content";

const benefitIcons = [MapPin, BadgeCheck, Megaphone, Shield];

interface BenefitsSectionProps {
  content: PageContentMap;
}

export function BenefitsSection({ content }: BenefitsSectionProps) {
  const benefits = [0, 1, 2, 3].map((index) => ({
    icon: benefitIcons[index],
    title: txt(content, `benefits.item_${index}.title`),
    description: txt(content, `benefits.item_${index}.description`),
  }));

  return (
    <section className="overflow-x-clip py-16 md:py-20">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={txt(content, "benefits.title")}
          subtitle={txt(content, "benefits.subtitle")}
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="border-0 shadow-sm bg-soft-gray">
              <CardContent className="p-6">
                <benefit.icon className="size-8 text-buffalo-red mb-4" />
                <h3 className="font-semibold text-navy text-lg">{benefit.title}</h3>
                <p className="text-muted mt-2 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
