import Link from "next/link";
import { Megaphone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdvertisingPromo() {
  return (
    <section className="overflow-x-clip py-16 md:py-20 bg-gradient-to-r from-navy to-navy-light text-white">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-4">
              <Megaphone className="size-4" />
              For Business Owners
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Get Found First with Sponsored Placement
            </h2>
            <p className="mt-4 text-white/80 text-lg leading-relaxed max-w-xl">
              Bid for top spots in search results and category pages. Set your daily
              budget, target keywords like &quot;Buffalo pizza&quot; or &quot;Amherst plumber,&quot;
              and only pay when customers see your listing.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="accent" size="lg" asChild>
                <Link href="/advertise">
                  Learn About Advertising
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/40 bg-transparent text-white shadow-none hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/dashboard/advertising">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
          <div className="flex-shrink-0 bg-white/10 rounded-2xl p-8 text-center lg:w-72">
            <div className="font-display text-5xl font-bold text-buffalo-red">$0.25</div>
            <p className="text-white/70 mt-2">minimum daily bid</p>
            <p className="text-sm text-white/50 mt-4">
              Up to 3 sponsored spots per search — highest bid wins
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
