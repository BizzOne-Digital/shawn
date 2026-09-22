import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Let's Go Buffalo.",
};

export default async function FaqPage() {
  const entries = await db.faqEntry.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="overflow-x-clip py-12 md:py-16">
      <div className="mx-auto max-w-3xl min-w-0 px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-navy">Frequently Asked Questions</h1>
        <p className="mt-4 text-lg text-muted">
          Quick answers about listings, membership, and using Let&apos;s Go Buffalo.
        </p>

        {entries.length === 0 ? (
          <div className="mt-12 rounded-xl border border-border bg-soft-gray p-8 text-center">
            <p className="text-muted">FAQ content is being updated. Please check back soon or contact us.</p>
            <Button variant="accent" className="mt-4" asChild>
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        ) : (
          <Accordion type="single" collapsible className="mt-10 w-full">
            {entries.map((entry) => (
              <AccordionItem key={entry.id} value={entry.id}>
                <AccordionTrigger className="text-left font-semibold text-navy">
                  {entry.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted leading-relaxed whitespace-pre-wrap">
                  {entry.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        <p className="mt-10 text-center text-sm text-muted">
          Still have questions?{" "}
          <Link href="/contact" className="font-medium text-buffalo-red hover:underline">
            Get in touch
          </Link>
        </p>
      </div>
    </div>
  );
}
