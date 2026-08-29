import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPageContent, txt } from "@/lib/content/page-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Let's Go Buffalo — Western New York's local business directory connecting Buffalo-area residents with trusted local businesses.",
};

const valueIcons = [Heart, MapPin, Users];

export default async function AboutPage() {
  const content = await getPageContent("about");

  const values = [0, 1, 2].map((index) => ({
    icon: valueIcons[index],
    title: txt(content, `values.item_${index}.title`),
    description: txt(content, `values.item_${index}.description`),
  }));

  return (
    <div className="overflow-x-clip py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-navy">
          {txt(content, "hero.title")}
        </h1>
        <p className="mt-6 text-lg text-muted leading-relaxed">
          {txt(content, "hero.intro")}
        </p>

        <div className="mt-12 prose prose-lg max-w-none text-muted leading-relaxed space-y-6">
          <p>{txt(content, "body.paragraph_1")}</p>
          <p>{txt(content, "body.paragraph_2")}</p>
          <p>{txt(content, "body.paragraph_3")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {values.map((value) => (
            <Card key={value.title} className="border-0 bg-soft-gray">
              <CardContent className="p-6">
                <value.icon className="size-8 text-buffalo-red mb-4" />
                <h3 className="font-semibold text-navy text-lg">{value.title}</h3>
                <p className="text-muted mt-2 text-sm leading-relaxed">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center bg-navy rounded-2xl p-10 text-white">
          <h2 className="font-display text-2xl font-bold">
            {txt(content, "cta.title")}
          </h2>
          <p className="mt-3 text-white/80">{txt(content, "cta.subtitle")}</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/submit">
              <Button variant="accent">
                {txt(content, "cta.primary")}
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                {txt(content, "cta.secondary")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
