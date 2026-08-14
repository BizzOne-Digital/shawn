"use client";

import Link from "next/link";
import {
  Home,
  MapPin,
  Search,
  ShoppingBag,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { HeroSearchBar } from "@/components/home/hero-search-bar";
import { Button } from "@/components/ui/button";
import { FadeInUp } from "@/components/ui/motion";

const serviceCards = [
  {
    icon: UtensilsCrossed,
    iconBg: "bg-buffalo-red",
    title: "Restaurants",
    subtitle: "Savor local flavors",
    image: "from-orange-200 to-red-300",
  },
  {
    icon: Home,
    iconBg: "bg-navy",
    title: "Home Services",
    subtitle: "Local experts you trust",
    image: "from-sky-200 to-blue-300",
  },
  {
    icon: ShoppingBag,
    iconBg: "bg-buffalo-red",
    title: "Shopping",
    subtitle: "Find unique local shops",
    image: "from-rose-200 to-pink-300",
  },
];

export function HeroSection() {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg.png"
          alt=""
          fill
          priority
          className="object-cover object-[center_30%] lg:object-right"
          sizes="100vw"
        />
      </div>

      <div className="hero-curves pointer-events-none absolute inset-x-0 bottom-0 h-32" aria-hidden="true" />

      <div className="relative mx-auto min-w-0 max-w-7xl px-4 pb-28 pt-10 sm:px-6 sm:pb-32 sm:pt-12 lg:px-8 lg:pb-36">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div className="max-w-xl">
            <FadeInUp>
              <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-navy sm:text-5xl lg:text-[3.4rem]">
                Discover the{" "}
                <span className="text-buffalo-red">Best</span>
                <br />
                of Buffalo
              </h1>
            </FadeInUp>

            <FadeInUp delay={0.1}>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-navy/75 sm:text-lg">
                Find trusted local businesses, hidden gems, and everything Western
                New York has to offer.
              </p>
            </FadeInUp>

            <FadeInUp delay={0.2}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button size="lg" variant="accent" className="h-12 px-6 text-base" asChild>
                  <Link href="/directory">
                    <Search className="size-4" />
                    Explore Businesses
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 border-navy/20 bg-white/95 px-6 text-base text-navy shadow-sm hover:bg-white"
                  asChild
                >
                  <Link href="/register">
                    <Store className="size-4" />
                    List Your Business
                  </Link>
                </Button>
              </div>
            </FadeInUp>
          </div>

          <div className="relative hidden min-h-[360px] lg:block">
            {serviceCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={reducedMotion ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: reducedMotion ? 0 : 0.15 + index * 0.12,
                  duration: reducedMotion ? 0 : 0.45,
                }}
                className="absolute z-10"
                style={{
                  top: `${12 + index * 30}%`,
                  right: index === 1 ? "8%" : index === 0 ? "22%" : "0%",
                }}
              >
                <div className="flex w-[250px] items-center gap-3 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-xl backdrop-blur-sm">
                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-full ${card.iconBg} text-white`}
                  >
                    <card.icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-navy">{card.title}</p>
                    <p className="truncate text-xs text-muted">{card.subtitle}</p>
                  </div>
                  <div
                    className={`size-12 shrink-0 rounded-xl bg-gradient-to-br ${card.image}`}
                  />
                </div>
              </motion.div>
            ))}

            <MapPin className="absolute right-[30%] top-[6%] size-5 fill-buffalo-red text-buffalo-red" />
            <MapPin className="absolute right-[10%] top-[24%] size-4 fill-buffalo-red text-buffalo-red" />
            <MapPin className="absolute right-[45%] bottom-[20%] size-4 fill-buffalo-red text-buffalo-red" />
          </div>
        </div>
      </div>

      <div className="relative z-20 mx-auto min-w-0 max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <FadeInUp delay={0.3}>
          <HeroSearchBar className="-mt-16 sm:-mt-20" />
        </FadeInUp>
      </div>
    </section>
  );
}
