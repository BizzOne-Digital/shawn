import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PageContentMap } from "@/lib/content/page-content";
import { txt } from "@/lib/content/page-content";

interface CtaSectionProps {
  content: PageContentMap;
}

export function CtaSection({ content }: CtaSectionProps) {
  return (
    <section className="overflow-x-clip py-16 md:py-20 bg-buffalo-red text-white">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold">
          {txt(content, "cta.title")}
        </h2>
        <p className="mt-4 text-white/90 text-lg max-w-2xl mx-auto">
          {txt(content, "cta.description")}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-white text-buffalo-red hover:bg-white/90"
            asChild
          >
            <Link href="/dashboard/submit">
              {txt(content, "cta.primary")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/40 bg-transparent text-white shadow-none hover:bg-white/10 hover:text-white"
            asChild
          >
            <Link href="/directory">{txt(content, "cta.secondary")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
