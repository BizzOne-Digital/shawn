import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "Let's Go Buffalo helped our Hertel Avenue shop get discovered by neighbors who didn't know we existed. Foot traffic is up 30%.",
    name: "Maria S.",
    business: "Elmwood Boutique Owner",
  },
  {
    quote:
      "As a Cheektowaga HVAC company, showing up when people search 'AC repair near me' through sponsored ads has been a game-changer.",
    name: "Tom R.",
    business: "WNY Comfort Services",
  },
  {
    quote:
      "Finally, a directory that actually understands Buffalo. No national chains drowning out our family restaurant.",
    name: "Angela & Joe M.",
    business: "Allentown Eatery",
  },
];

export function TestimonialsSection() {
  return (
    <section className="overflow-x-clip py-16 md:py-20 bg-soft-gray">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="What Buffalo Says"
          subtitle="Hear from local business owners and residents across the 716"
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
