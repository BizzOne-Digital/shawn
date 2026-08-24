import type { Metadata } from "next";
import Link from "next/link";
import { LgbEmailRequestForm } from "@/components/forms/lgb-email-request-form";
import { getPageContent, txt } from "@/lib/content/page-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Get Your @LetsGoBuffalo.com Email",
  description: "Request a custom Let's Go Buffalo email address with forwarding.",
};

export default async function LgbEmailPage() {
  const content = await getPageContent("lgb-email");

  const bullets = [0, 1, 2].map((index) => txt(content, `bullets.item_${index}`));

  return (
    <div className="overflow-x-clip py-12 md:py-16">
      <div className="mx-auto max-w-2xl min-w-0 px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-navy">{txt(content, "hero.title")}</h1>
        <p className="mt-4 text-lg text-muted">{txt(content, "hero.subtitle")}</p>

        <ul className="mt-6 space-y-2 text-sm text-muted">
          {bullets.map((bullet) => (
            <li key={bullet}>• {bullet}</li>
          ))}
        </ul>

        <div className="mt-10">
          <LgbEmailRequestForm />
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          {txt(content, "footer.text")}{" "}
          <Link href="/pricing" className="text-buffalo-red hover:underline">
            View membership plans
          </Link>
        </p>
      </div>
    </div>
  );
}
