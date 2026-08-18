import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, DollarSign, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NewsletterForm } from "@/components/forms/newsletter-form";

export const metadata: Metadata = {
  title: "Advertise",
  description:
    "Promote your Buffalo-area business with sponsored placement on Let's Go Buffalo. Bid for top search results starting at $0.25/day.",
};

const features = [
  {
    icon: Target,
    title: "Keyword Targeting",
    description:
      "Target searches like \"Buffalo pizza,\" \"Amherst electrician,\" or your specific service category.",
  },
  {
    icon: DollarSign,
    title: "Flexible Bidding",
    description:
      "Set your daily bid starting at $0.25. Higher bids earn top placement — up to 3 sponsored spots per search.",
  },
  {
    icon: BarChart3,
    title: "Track Performance",
    description:
      "Monitor impressions, clicks, and leads from your dashboard. Adjust bids anytime.",
  },
  {
    icon: Zap,
    title: "Instant Visibility",
    description:
      "Active campaigns appear at the top of search results with a clear \"Ad\" label — right where customers are looking.",
  },
];

export default function AdvertisePage() {
  return (
    <div className="overflow-x-clip py-12 md:py-16">
      <div className="mx-auto max-w-5xl min-w-0 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold text-navy md:text-5xl">
            Advertise on Let&apos;s Go Buffalo
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Put your business at the top of search results when Buffalo-area
            customers are actively looking for what you offer. Pay-per-impression
            bidding keeps you in control of your budget.
          </p>
          <Link href="/dashboard/advertising" className="mt-8 inline-block">
            <Button variant="accent" size="lg">
              Go to Advertising Dashboard
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
            How Bidding Works
          </h2>
          <div className="mt-8 space-y-6 leading-relaxed text-white/80">
            <div className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-buffalo-red text-sm font-bold">
                1
              </span>
              <p>
                <strong className="text-white">Create a campaign</strong> in your
                dashboard and set a daily bid (minimum $0.25).
              </p>
            </div>
            <div className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-buffalo-red text-sm font-bold">
                2
              </span>
              <p>
                <strong className="text-white">Choose targeting</strong> — keywords,
                categories, or cities from your listed service area.
              </p>
            </div>
            <div className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-buffalo-red text-sm font-bold">
                3
              </span>
              <p>
                <strong className="text-white">Win placement</strong> — top bidders
                appear as sponsored results when customers search.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/register">
              <Button variant="accent" size="lg" className="w-full sm:w-auto">
                Create Free Account
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/dashboard/advertising">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-white/40 bg-transparent text-white shadow-none hover:bg-white/10 hover:text-white sm:w-auto"
              >
                Start Advertising
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-soft-gray p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-navy">Stay in the loop</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted">
            Subscribe for advertising tips and Buffalo business updates.
          </p>
          <NewsletterForm variant="inline" className="mx-auto mt-6 max-w-md" />
        </div>

        <p className="mt-10 text-center text-sm text-muted">
          Don&apos;t have a listing yet?{" "}
          <Link href="/register" className="text-buffalo-red hover:underline">
            List your business free
          </Link>{" "}
          before creating an ad campaign.
        </p>
      </div>
    </div>
  );
}
