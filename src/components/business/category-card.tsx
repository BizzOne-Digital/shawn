import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CategoryCardProps {
  category: {
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    _count?: { businesses: number };
  };
}

export function CategoryCard({ category }: CategoryCardProps) {
  const count = category._count?.businesses ?? 0;

  return (
    <Link href={`/categories/${category.slug}`}>
      <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-navy/20">
        <CardContent className="p-6 text-center">
          <div className="size-14 mx-auto mb-4 rounded-xl bg-navy/5 flex items-center justify-center text-2xl group-hover:bg-buffalo-red/10 transition-colors">
            {category.icon ?? category.name[0]}
          </div>
          <h3 className="font-semibold text-navy group-hover:text-buffalo-red transition-colors">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-sm text-muted mt-2 line-clamp-2">{category.description}</p>
          )}
          <p className="text-xs text-muted mt-3">
            {count} {count === 1 ? "business" : "businesses"}
          </p>
          <span className="inline-flex items-center gap-1 text-sm text-buffalo-red mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            Browse <ArrowRight className="size-3" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
