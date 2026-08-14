import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryCard } from "@/components/business/category-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";

interface PopularCategoriesProps {
  categories: {
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    _count?: { businesses: number };
  }[];
}

export function PopularCategories({ categories }: PopularCategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <section className="overflow-x-clip py-16 md:py-20 bg-soft-gray">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Popular Categories"
          subtitle="Browse Buffalo-area businesses by what you're looking for"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/directory">
            <Button variant="outline">
              View All Categories
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
