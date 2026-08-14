import { Search, Building2, TrendingUp } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";

const steps = [
  {
    icon: Search,
    title: "Search & Discover",
    description:
      "Find restaurants on Hertel, contractors in Cheektowaga, or shops on Elmwood — all in one Buffalo-focused directory.",
  },
  {
    icon: Building2,
    title: "Connect with Locals",
    description:
      "View hours, contact info, and services from verified Western New York businesses you can trust.",
  },
  {
    icon: TrendingUp,
    title: "Support & Grow",
    description:
      "List your business for free, reach more customers, and boost visibility with optional sponsored placement.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="overflow-x-clip py-16 md:py-20 bg-soft-gray scroll-mt-28">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="How It Works"
          subtitle="Three simple steps to find and support Buffalo-area businesses"
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
