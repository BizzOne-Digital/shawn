"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryOption {
  slug: string;
  name: string;
  subcategories: { slug: string; name: string }[];
}

interface DirectoryFiltersProps {
  categories: CategoryOption[];
  cities: string[];
  current: {
    category?: string;
    subcategory?: string;
    city?: string;
    openNow?: boolean;
    verified?: boolean;
    featured?: boolean;
    sort?: string;
    view?: string;
  };
}

export function DirectoryFilters({ categories, cities, current }: DirectoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    router.push(`/directory?${params.toString()}`);
  }

  const selectedCategory = categories.find((c) => c.slug === current.category);
  const subcategories = selectedCategory?.subcategories ?? [];

  return (
    <div className="bg-white rounded-xl border border-border p-6 space-y-6">
      <div className="flex items-center gap-2 text-navy font-semibold">
        <Filter className="size-4" />
        Filters
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={current.category ?? "all"}
          onValueChange={(v) =>
            updateParams({ category: v === "all" ? undefined : v, subcategory: undefined })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.slug} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {subcategories.length > 0 && (
        <div className="space-y-2">
          <Label>Subcategory</Label>
          <Select
            value={current.subcategory ?? "all"}
            onValueChange={(v) =>
              updateParams({ subcategory: v === "all" ? undefined : v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All subcategories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subcategories</SelectItem>
              {subcategories.map((sub) => (
                <SelectItem key={sub.slug} value={sub.slug}>
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {cities.length > 0 && (
        <div className="space-y-2">
          <Label>Town</Label>
          <Select
            value={current.city ?? "all"}
            onValueChange={(v) => updateParams({ city: v === "all" ? undefined : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All towns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Sort by</Label>
        <Select
          value={current.sort ?? "newest"}
          onValueChange={(v) => updateParams({ sort: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="popular">Most popular</SelectItem>
            <SelectItem value="name">Name (A–Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 pt-2 border-t border-border">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={current.openNow ?? false}
            onCheckedChange={(checked) =>
              updateParams({ openNow: checked ? "true" : undefined })
            }
          />
          <span className="text-sm">Open now</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={current.verified ?? false}
            onCheckedChange={(checked) =>
              updateParams({ verified: checked ? "true" : undefined })
            }
          />
          <span className="text-sm">Verified only</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={current.featured ?? false}
            onCheckedChange={(checked) =>
              updateParams({ featured: checked ? "true" : undefined })
            }
          />
          <span className="text-sm">Featured only</span>
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          variant={current.view === "list" ? "default" : "outline"}
          size="sm"
          className="flex-1"
          onClick={() => updateParams({ view: "list" })}
        >
          List
        </Button>
        <Button
          variant={current.view !== "list" ? "default" : "outline"}
          size="sm"
          className="flex-1"
          onClick={() => updateParams({ view: "grid" })}
        >
          Grid
        </Button>
      </div>

      {(current.category ||
        current.subcategory ||
        current.city ||
        current.openNow ||
        current.verified ||
        current.featured) && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => router.push("/directory")}
        >
          Clear all filters
        </Button>
      )}
    </div>
  );
}
