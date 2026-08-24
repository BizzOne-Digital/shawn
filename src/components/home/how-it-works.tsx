import { Search, Building2, TrendingUp } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import type { PageContentMap } from "@/lib/content/page-content";
import { txt } from "@/lib/content/page-content";

const stepIcons = [Search, Building2, TrendingUp];

interface HowItWorksSectionProps {
  content: PageContentMap;
}

export function HowItWorksSection({ content }: HowItWorksSectionProps) {
  const steps = [0, 1, 2].map((index) => ({
    icon: stepIcons[index],
    title: txt(content, `how_it_works.step_${index}.title`),
    description: txt(content, `how_it_works.step_${index}.description`),
  }));

  return (
    <section id="how-it-works" className="overflow-x-clip py-16 md:py-20 bg-soft-gray scroll-mt-28">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={txt(content, "how_it_works.title")}
          subtitle={txt(content, "how_it_works.subtitle")}
        />
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="text-center">
              <div className="size-16 mx-auto mb-4 rounded-2xl bg-navy text-white flex items-center justify-center">
                <step.icon className="size-7" />
              </div>
              <span className="text-sm font-semibold text-buffalo-red">
                Step {index + 1}
              </span>
              <h3 className="font-display text-xl font-semibold text-navy mt-2">
                {step.title}
              </h3>
              <p className="text-muted mt-3 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
