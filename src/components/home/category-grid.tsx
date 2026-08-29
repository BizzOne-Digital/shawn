"use client";

import Link from "next/link";
import {
  Briefcase,
  Coffee,
  Heart,
  Home,
  ShoppingBag,
  Sparkles,
  type LucideIcon,
  Utensils,
  Wrench,
} from "lucide-react";

import { FadeInUp, HoverScale, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

export interface CategoryItem {
  name: string;
  slug: string;
  count?: number;
  icon?: string;
}

const iconMap: Record<string, LucideIcon> = {
  restaurants: Utensils,
  food: Utensils,
  dining: Utensils,
  services: Wrench,
  home: Home,
  retail: ShoppingBag,
  shopping: ShoppingBag,
  health: Heart,
  wellness: Heart,
  professional: Briefcase,
  coffee: Coffee,
  default: Sparkles,
};

function getCategoryIcon(slug: string, name: string): LucideIcon {
  const key = slug.toLowerCase();
  if (iconMap[key]) return iconMap[key];
  const nameKey = name.toLowerCase().split(" ")[0];
  return iconMap[nameKey] ?? iconMap.default;
}

interface CategoryGridProps {
  categories: CategoryItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function CategoryGrid({
  categories,
  title = "Popular Categories",
  subtitle = "Browse businesses by what you're looking for",
  className,
}: CategoryGridProps) {
  return (
    <section className={cn("bg-soft-gray py-16 sm:py-20", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeInUp className="text-center">
          <h2 className="font-display text-3xl font-bold text-navy sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-muted">{subtitle}</p>
        </FadeInUp>

        <StaggerContainer className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.slug, category.name);
            return (
              <StaggerItem key={category.slug}>
                <HoverScale>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="group flex flex-col items-center rounded-xl border border-border bg-background p-6 text-center shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex size-14 items-center justify-center rounded-xl bg-navy/5 text-navy transition-colors group-hover:bg-buffalo-red group-hover:text-white">
                      <Icon className="size-7" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold text-navy group-hover:text-buffalo-red">
                      {category.name}
                    </h3>
                    {category.count !== undefined && (
                      <p className="mt-1 text-sm text-muted">
                        {category.count.toLocaleString()} businesses
                      </p>
                    )}
                  </Link>
                </HoverScale>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <FadeInUp delay={0.2} className="mt-10 text-center">
          <Link
            href="/categories"
            className="text-sm font-medium text-navy underline-offset-4 hover:text-buffalo-red hover:underline"
          >
            View all categories →
          </Link>
        </FadeInUp>
      </div>
    </section>
  );
}
