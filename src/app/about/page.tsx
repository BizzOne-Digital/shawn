import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Let's Go Buffalo — Western New York's local business directory connecting Buffalo-area residents with trusted local businesses.",
};

const values = [
  {
    icon: Heart,
    title: "Love Local",
    description:
      "We're Buffalonians who believe in supporting the shops, restaurants, and services that make our neighborhoods unique — from Allentown to the Southtowns.",
  },
  {
    icon: MapPin,
    title: "716 Focused",
    description:
      "This isn't a national directory with Buffalo as an afterthought. Every feature, every category, every search is built for Western New York.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "Business owners list for free. Residents discover honestly. We moderate listings to keep the directory trustworthy and spam-free.",
  },
];

export default function AboutPage() {
  return (
    <div className="overflow-x-clip py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-navy">
          About Let&apos;s Go Buffalo
        </h1>
        <p className="mt-6 text-lg text-muted leading-relaxed">
          Let&apos;s Go Buffalo is Western New York&apos;s homegrown business directory —
          built to help Buffalonians discover great local restaurants, contractors,
          retailers, and service providers while giving WNY business owners a free
          platform to reach new customers.
        </p>

        <div className="mt-12 prose prose-lg max-w-none text-muted leading-relaxed space-y-6">
          <p>
            Whether you&apos;re searching for a plumber in Cheektowaga, a date-night
            spot on Elmwood, or a family dentist in Williamsville, we make it easy
            to find businesses you can trust — with verified listings, real hours,
            and direct contact info.
          </p>
          <p>
            Founded with a simple mission: keep more dollars circulating in the 716
            economy. We&apos;re not owned by a Silicon Valley conglomerate. We&apos;re
            neighbors who care about Hertel, the waterfront, the suburbs, and every
            block in between.
          </p>
          <p>
            For business owners, listing is always free. Optional sponsored
            placement lets you bid for top spots in search results — putting your
            business in front of customers actively looking for what you offer.
          </p>
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
            Join the Buffalo Business Community
          </h2>
          <p className="mt-3 text-white/80">
            List your business free or get in touch with our team.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/submit">
              <Button variant="accent">
                List Your Business
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
