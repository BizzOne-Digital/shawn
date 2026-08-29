import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryCard } from "@/components/business/category-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import type { PageContentMap } from "@/lib/content/page-content";
import { txt } from "@/lib/content/page-content";

interface PopularCategoriesProps {
  categories: {
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    _count?: { businesses: number };
  }[];
  content: PageContentMap;
}

export function PopularCategories({ categories, content }: PopularCategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <section className="overflow-x-clip py-16 md:py-20 bg-soft-gray">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={txt(content, "popular_categories.title")}
          subtitle={txt(content, "popular_categories.subtitle")}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/directory">
            <Button variant="outline">
              {txt(content, "popular_categories.cta")}
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
