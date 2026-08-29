import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, DollarSign, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { getPageContent, txt } from "@/lib/content/page-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Advertise",
  description:
    "Promote your Buffalo-area business with sponsored placement on Let's Go Buffalo. Bid for top search results starting at $0.25/day.",
};

const featureIcons = [Target, DollarSign, BarChart3, Zap];

export default async function AdvertisePage() {
  const content = await getPageContent("advertise");

  const features = [0, 1, 2, 3].map((index) => ({
    icon: featureIcons[index],
    title: txt(content, `features.item_${index}.title`),
    description: txt(content, `features.item_${index}.description`),
  }));

  return (
    <div className="overflow-x-clip py-12 md:py-16">
      <div className="mx-auto max-w-5xl min-w-0 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold text-navy md:text-5xl">
            {txt(content, "hero.title")}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            {txt(content, "hero.subtitle")}
          </p>
          <Link href="/dashboard/advertising" className="mt-8 inline-block">
            <Button variant="accent" size="lg">
              {txt(content, "hero.cta")}
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="p-6">
                <feature.icon className="mb-4 size-8 text-buffalo-red" />
                <h3 className="text-lg font-semibold text-navy">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-navy p-8 text-white md:p-10">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            {txt(content, "bidding.title")}
          </h2>
          <div className="mt-8 space-y-6 leading-relaxed text-white/80">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-buffalo-red text-sm font-bold">
                  {step}
                </span>
                <p>{txt(content, `bidding.step_${step}`)}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/register">
              <Button variant="accent" size="lg" className="w-full sm:w-auto">
                {txt(content, "bidding.cta_primary")}
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/dashboard/advertising">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-white/40 bg-transparent text-white shadow-none hover:bg-white/10 hover:text-white sm:w-auto"
              >
                {txt(content, "bidding.cta_secondary")}
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-soft-gray p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-navy">
            {txt(content, "newsletter.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted">
            {txt(content, "newsletter.subtitle")}
          </p>
          <NewsletterForm variant="inline" className="mx-auto mt-6 max-w-md" />
        </div>

        <p className="mt-10 text-center text-sm text-muted">
          {txt(content, "footer_note.text")}{" "}
          <Link href="/register" className="text-buffalo-red hover:underline">
            List your business free
          </Link>
        </p>
      </div>
    </div>
  );
}
