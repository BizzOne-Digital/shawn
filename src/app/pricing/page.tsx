import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { MemberType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle, Building2, User } from "lucide-react";
import { formatPlanPrice } from "@/lib/services/membership";
import { getPageContent, txt } from "@/lib/content/page-content";

export const metadata: Metadata = {
  title: "Membership & Pricing",
  description:
    "Choose the right Let's Go Buffalo membership for your business or join as an individual member.",
};

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const [plans, content] = await Promise.all([
    db.membershipPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    getPageContent("pricing"),
  ]);

  const businessPlans = plans.filter((p) => p.memberType === MemberType.BUSINESS);
  const individualPlans = plans.filter((p) => p.memberType === MemberType.INDIVIDUAL);

  return (
    <div className="overflow-x-clip">
      <div className="hero-gradient py-16 lg:py-24">
        <div className="mx-auto max-w-4xl min-w-0 px-4 text-center">
          <Badge className="bg-buffalo-red/20 text-white border-buffalo-red/30 mb-4">
            {txt(content, "hero.badge")}
          </Badge>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-white mb-4">
            {txt(content, "hero.title")}
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            {txt(content, "hero.subtitle")}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl min-w-0 space-y-20 px-4 py-16">
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Building2 className="size-8 text-buffalo-red" />
            <h2 className="font-display text-3xl font-bold text-navy">
              {txt(content, "business.title")}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {businessPlans.map((plan) => {
              const features = (plan.features as string[]) ?? [];
              const monthly = Number(plan.monthlyPrice);
              const yearly = Number(plan.yearlyPrice);
              const isFree = monthly === 0;

              return (
                <Card
                  key={plan.id}
                  className={plan.businessTier === "PRO" ? "border-buffalo-red shadow-lg relative" : ""}
                >
                  {plan.businessTier === "PRO" && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-buffalo-red">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="pt-4">
                      <span className="text-3xl font-bold text-navy">
                        {isFree ? "Free" : `$${monthly.toFixed(2)}`}
                      </span>
                      {!isFree && (
                        <span className="text-muted text-sm">/month</span>
                      )}
                      {!isFree && yearly > 0 && (
                        <p className="text-sm text-buffalo-red mt-1">
                          or ${yearly.toFixed(0)}/year (pre-launch)
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-muted">
                          <CheckCircle className="size-4 text-buffalo-red flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href={isFree ? "/register" : `/dashboard/subscribe?plan=${plan.slug}`} className="w-full">
                      <Button
                        variant={plan.businessTier === "PRO" ? "accent" : "outline"}
                        className="w-full"
                      >
                        {isFree ? "Get Started Free" : "Subscribe"}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-8">
            <User className="size-8 text-buffalo-red" />
            <h2 className="font-display text-3xl font-bold text-navy">
              {txt(content, "individual.title")}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
            {individualPlans.map((plan) => {
              const features = (plan.features as string[]) ?? [];
              const monthly = Number(plan.monthlyPrice);
              const yearly = Number(plan.yearlyPrice);
              const isFree = monthly === 0;

              return (
                <Card key={plan.id}>
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="pt-4">
                      <span className="text-3xl font-bold text-navy">
                        {formatPlanPrice(monthly, yearly)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-muted">
                          <CheckCircle className="size-4 text-buffalo-red flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href={isFree ? "/register?type=individual" : `/dashboard/subscribe?plan=${plan.slug}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        {isFree ? "Join Free" : "Subscribe"}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="bg-soft-gray rounded-2xl p-8 text-center">
          <h3 className="font-display text-2xl font-bold text-navy mb-2">
            {txt(content, "advertising.title")}
          </h3>
          <p className="text-muted mb-6 max-w-xl mx-auto">
            {txt(content, "advertising.description")}
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/advertise">
              <Button variant="accent">{txt(content, "advertising.cta")}</Button>
            </Link>
            <Link href="/email-enrollment">
              <Button variant="outline">Get Your @LetsGoBuffalo.com Email</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
