import Link from "next/link";
import { Megaphone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PageContentMap } from "@/lib/content/page-content";
import { txt } from "@/lib/content/page-content";

interface AdvertisingPromoProps {
  content: PageContentMap;
}

export function AdvertisingPromo({ content }: AdvertisingPromoProps) {
  return (
    <section className="overflow-x-clip py-16 md:py-20 bg-gradient-to-r from-navy to-navy-light text-white">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-4">
              <Megaphone className="size-4" />
              {txt(content, "advertising.badge")}
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              {txt(content, "advertising.title")}
            </h2>
            <p className="mt-4 text-white/80 text-lg leading-relaxed max-w-xl">
              {txt(content, "advertising.description")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="accent" size="lg" asChild>
                <Link href="/advertise">
                  {txt(content, "advertising.cta_primary")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/40 bg-transparent text-white shadow-none hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/dashboard/advertising">{txt(content, "advertising.cta_secondary")}</Link>
              </Button>
            </div>
          </div>
          <div className="flex-shrink-0 bg-white/10 rounded-2xl p-8 text-center lg:w-72">
            <div className="font-display text-5xl font-bold text-buffalo-red">
              {txt(content, "advertising.price")}
            </div>
            <p className="text-white/70 mt-2">{txt(content, "advertising.price_label")}</p>
            <p className="text-sm text-white/50 mt-4">
              {txt(content, "advertising.price_note")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
