import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, DollarSign, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-navy">
            Advertise on Let&apos;s Go Buffalo
          </h1>
          <p className="mt-6 text-lg text-muted leading-relaxed">
            Put your business at the top of search results when Buffalo-area
            customers are actively looking for what you offer. Pay-per-impression
            bidding keeps you in control of your budget.
          </p>
          <Link href="/dashboard/advertising" className="inline-block mt-8">
            <Button variant="accent" size="lg">
              Go to Advertising Dashboard
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-16">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="p-6">
                <feature.icon className="size-8 text-buffalo-red mb-4" />
                <h3 className="font-semibold text-navy text-lg">{feature.title}</h3>
                <p className="text-muted mt-2 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-navy rounded-2xl p-10 text-white">
          <h2 className="font-display text-2xl md:text-3xl font-bold">
            How Bidding Works
          </h2>
          <div className="mt-8 space-y-6 text-white/80 leading-relaxed">
            <div className="flex gap-4">
              <span className="flex-shrink-0 size-8 rounded-full bg-buffalo-red flex items-center justify-center text-sm font-bold">
                1
              </span>
              <p>
                <strong className="text-white">Create a campaign</strong> in your
                dashboard and set a daily bid (minimum $0.25). Add budget for how
                long you want to run.
              </p>
            </div>
            <div className="flex gap-4">
              <span className="flex-shrink-0 size-8 rounded-full bg-buffalo-red flex items-center justify-center text-sm font-bold">
                2
              </span>
              <p>
                <strong className="text-white">Choose targeting</strong> — all
                searches, specific keywords, categories, or cities like Buffalo or
                Cheektowaga.
              </p>
            </div>
            <div className="flex gap-4">
              <span className="flex-shrink-0 size-8 rounded-full bg-buffalo-red flex items-center justify-center text-sm font-bold">
                3
              </span>
              <p>
                <strong className="text-white">Win placement</strong> — the top 3
                highest bidders appear as sponsored results. Ties go to the earliest
                bid. You&apos;re only charged when your ad is shown.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard/advertising">
              <Button variant="accent" size="lg">
                Start Advertising
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-muted mt-10">
          Don&apos;t have a listing yet?{" "}
          <Link href="/dashboard/submit" className="text-buffalo-red hover:underline">
            List your business free
          </Link>{" "}
          before creating an ad campaign.
        </p>
      </div>
    </div>
  );
}
