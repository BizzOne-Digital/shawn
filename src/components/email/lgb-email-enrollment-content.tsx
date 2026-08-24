import Link from "next/link";
import { ArrowRight, Forward, Mail, ShieldCheck } from "lucide-react";
import { LgbEmailRequestForm } from "@/components/forms/lgb-email-request-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPageContent, txt } from "@/lib/content/page-content";

const exampleAddresses = [
  "Sally@letsgobuffalo.com",
  "JoesPizza@letsgobuffalo.com",
  "BuffaloBakery@letsgobuffalo.com",
];

const stepIcons = [Mail, Forward, ShieldCheck];

export async function LgbEmailEnrollmentContent() {
  const content = await getPageContent("lgb-email");

  const bullets = [0, 1, 2].map((index) => txt(content, `bullets.item_${index}`));
  const steps = [0, 1, 2].map((index) => ({
    title: txt(content, `steps.item_${index}.title`),
    description: txt(content, `steps.item_${index}.description`),
  }));

  return (
    <div className="overflow-x-clip">
      <section className="hero-gradient py-16 md:py-20">
        <div className="mx-auto max-w-4xl min-w-0 px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-white/10">
            <Mail className="size-8 text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
            {txt(content, "hero.title")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            {txt(content, "hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {exampleAddresses.map((address) => (
              <span
                key={address}
                className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white"
              >
                {address}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl min-w-0 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = stepIcons[index] ?? Mail;
            return (
              <Card key={step.title}>
                <CardContent className="p-6">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-buffalo-red/10">
                    <Icon className="size-5 text-buffalo-red" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-buffalo-red">
                    Step {index + 1}
                  </p>
                  <h2 className="mt-2 font-display text-lg font-semibold text-navy">{step.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <ul className="mt-10 space-y-2 text-sm text-muted">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2">
              <span className="text-buffalo-red">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10" id="request-form">
          <h2 className="font-display text-2xl font-bold text-navy">
            {txt(content, "form.title")}
          </h2>
          <p className="mt-2 text-muted">{txt(content, "form.subtitle")}</p>
          <div className="mt-6">
            <LgbEmailRequestForm />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-soft-gray p-6 sm:flex-row">
          <div>
            <p className="font-medium text-navy">{txt(content, "footer.text")}</p>
            <p className="mt-1 text-sm text-muted">
              Pro business and individual memberships include a custom @LetsGoBuffalo.com address.
            </p>
          </div>
          <Link href="/pricing">
            <Button variant="accent">
              View membership plans
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
