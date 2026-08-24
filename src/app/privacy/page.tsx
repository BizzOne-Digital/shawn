import type { Metadata } from "next";
import { getPageContent, txt } from "@/lib/content/page-content";
import { LegalSections } from "@/components/content/legal-sections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Let's Go Buffalo business directory.",
};

export default async function PrivacyPage() {
  const content = await getPageContent("privacy");

  return (
    <div className="overflow-x-clip py-12 md:py-16">
      <div className="mx-auto max-w-3xl min-w-0 px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-navy">
          {txt(content, "hero.title")}
        </h1>
        <p className="text-sm text-muted mt-2">{txt(content, "hero.updated")}</p>

        <div className="prose prose-sm mt-10 max-w-none break-words space-y-8 text-muted">
          <LegalSections content={content} prefix="privacy" />
        </div>
      </div>
    </div>
  );
}
