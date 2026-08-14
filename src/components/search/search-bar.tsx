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
import { MapPin, Search } from "lucide-react";

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

const BUFFALO_AREA_CITIES = [
  "All Locations",
  "Buffalo",
  "Amherst",
  "Cheektowaga",
  "Hamburg",
  "Williamsville",
  "Tonawanda",
  "Kenmore",
  "West Seneca",
  "East Aurora",
  "Niagara Falls",
];

interface SearchBarProps {
  defaultQuery?: string;
  defaultCity?: string;
  placeholder?: string;
  className?: string;
  size?: "default" | "lg";
  showLocation?: boolean;
}

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

export function SearchBar({
  defaultQuery = "",
  defaultCity = "All Locations",
  placeholder = "Search businesses, services, or categories...",
  className,
  size = "default",
  showLocation = true,
}: SearchBarProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(defaultQuery);
  const [city, setCity] = useState(defaultCity);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const submitSearch = useCallback(
    (searchQuery?: string) => {
      const q = (searchQuery ?? query).trim();
      if (!q) return;

      const params = new URLSearchParams({ q });
      if (city && city !== "All Locations") {
        params.set("city", city);
      }

      setIsOpen(false);
      router.push(`/search?${params.toString()}`);
    },
    [query, city, router]
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
    if (!isOpen || suggestions.length === 0) {
      if (event.key === "Enter") return;
      return;
    }

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

  const isLarge = size === "lg";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("w-full", className)}
      role="search"
    >
      <div
        ref={containerRef}
        className={cn(
          "relative flex flex-col gap-2 rounded-xl border border-border bg-background shadow-sm sm:flex-row sm:items-stretch",
          isLarge && "rounded-2xl shadow-md"
        )}
      >
        <div className="relative min-w-0 flex-1">
          <Search
            className={cn(
              "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted",
              isLarge && "left-4 size-5"
            )}
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            className={cn(
              "border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0",
              isLarge && "h-14 pl-12 text-base"
            )}
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

        {showLocation && (
          <>
            <div className="hidden w-px bg-border sm:block" />
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger
                className={cn(
                  "w-full border-0 bg-transparent shadow-none focus:ring-0 sm:w-44",
                  isLarge && "h-14"
                )}
              >
                <MapPin className="mr-2 size-4 shrink-0 text-buffalo-red" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {BUFFALO_AREA_CITIES.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        <Button
          type="submit"
          variant="accent"
          className={cn(
            "rounded-t-none rounded-b-xl sm:rounded-l-none sm:rounded-r-xl sm:rounded-t-xl",
            isLarge && "h-14 px-8 text-base"
          )}
        >
          Search
        </Button>
      </div>
    </form>
  );
}
