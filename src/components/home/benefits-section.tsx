import { BadgeCheck, MapPin, Megaphone, Shield } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: MapPin,
    title: "Hyper-Local Focus",
    description:
      "Built for Buffalo, Amherst, Cheektowaga, and every corner of Western New York — not a generic national directory.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Listings",
    description:
      "Look for the verified badge on businesses that have been reviewed by our team for accuracy and legitimacy.",
  },
  {
    icon: Megaphone,
    title: "Free to List",
    description:
      "Every local business deserves visibility. Basic listings are free — always. Optional ads help you stand out.",
  },
  {
    icon: Shield,
    title: "Community First",
    description:
      "We prioritize local ownership, honest reviews, and keeping dollars circulating in the 716 economy.",
  },
];

export function BenefitsSection() {
  return (
    <section className="overflow-x-clip py-16 md:py-20">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Why Let's Go Buffalo?"
          subtitle="The directory Western New York businesses and residents actually use"
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
