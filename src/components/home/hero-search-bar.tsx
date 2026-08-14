"use client";

import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Grid3X3, MapPin, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SearchSuggestions,
  type SearchSuggestion,
} from "@/components/search/search-suggestions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const HERO_CATEGORIES = [
  { value: "all", label: "Category" },
  { value: "restaurants", label: "Restaurants" },
  { value: "home-services", label: "Home Services" },
  { value: "shopping", label: "Shopping" },
  { value: "health-beauty", label: "Health & Beauty" },
  { value: "automotive", label: "Automotive" },
];

const HERO_LOCATIONS = [
  { value: "buffalo", label: "Buffalo, NY" },
  { value: "amherst", label: "Amherst, NY" },
  { value: "cheektowaga", label: "Cheektowaga, NY" },
  { value: "williamsville", label: "Williamsville, NY" },
  { value: "niagara-falls", label: "Niagara Falls, NY" },
];

async function fetchSuggestions(query: string): Promise<SearchSuggestion[]> {
  if (query.trim().length < 2) return [];

  try {
    const res = await fetch(
      `/api/search/suggestions?q=${encodeURIComponent(query.trim())}`
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { suggestions?: string[] };
    return (data.suggestions ?? []).map((text) => ({ text, type: "query" as const }));
  } catch {
    return [];
  }
}

export function HeroSearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("buffalo");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const submitSearch = useCallback(
    (searchQuery?: string) => {
      const q = (searchQuery ?? query).trim();
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category && category !== "all") params.set("category", category);
      if (city && city !== "buffalo") params.set("city", city);

      setIsOpen(false);
      router.push(params.toString() ? `/search?${params.toString()}` : "/search");
    },
    [query, category, city, router]
  );

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      const results = await fetchSuggestions(query);
      setSuggestions(results);
      setIsLoading(false);
      setActiveIndex(-1);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      submitSearch(suggestions[activeIndex].text);
    } else {
      submitSearch();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          event.preventDefault();
          submitSearch(suggestions[activeIndex].text);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("mx-auto w-full max-w-5xl", className)}
      role="search"
    >
      <div
        ref={containerRef}
        className="relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-white shadow-2xl lg:flex-row lg:items-stretch"
      >
        <div className="relative min-w-0 flex-[1.4] border-b border-border/60 lg:border-b-0 lg:border-r">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <Input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="What are you looking for?"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            className="h-14 border-0 bg-transparent pl-12 text-base shadow-none focus-visible:ring-0"
          />
          <SearchSuggestions
            suggestions={suggestions}
            query={query}
            isLoading={isLoading}
            isOpen={isOpen && query.trim().length >= 1}
            activeIndex={activeIndex}
            onSelect={(text) => {
              setQuery(text);
              submitSearch(text);
            }}
            onHover={setActiveIndex}
          />
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-14 w-full rounded-none border-0 border-b border-border/60 bg-transparent shadow-none focus:ring-0 lg:w-48 lg:border-b-0 lg:border-r">
            <Grid3X3 className="mr-2 size-4 shrink-0 text-navy" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {HERO_CATEGORIES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="h-14 w-full rounded-none border-0 border-b border-border/60 bg-transparent shadow-none focus:ring-0 lg:w-44 lg:border-b-0 lg:border-r">
            <MapPin className="mr-2 size-4 shrink-0 text-buffalo-red" />
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            {HERO_LOCATIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="submit"
          variant="accent"
          className="h-14 w-full rounded-none px-6 text-base font-semibold sm:px-8 lg:min-w-[140px] lg:w-auto"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
