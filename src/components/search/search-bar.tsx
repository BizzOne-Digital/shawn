"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useRef,
} from "react";
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

const ALL_TOWNS = "all";

interface SearchBarProps {
  defaultQuery?: string;
  defaultCity?: string;
  placeholder?: string;
  className?: string;
  size?: "default" | "lg";
  showLocation?: boolean;
  hint?: string;
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
  defaultCity = ALL_TOWNS,
  placeholder = "Search businesses, services, towns, or categories...",
  className,
  size = "default",
  showLocation = true,
  hint,
}: SearchBarProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(defaultQuery);
  const [city, setCity] = useState(defaultCity);
  const [cities, setCities] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    fetch("/api/public/locations")
      .then((res) => res.json())
      .then((data: { cities?: string[] }) => setCities(data.cities ?? []))
      .catch(() => setCities([]));
  }, []);

  const visibleSuggestions = query.trim().length < 2 ? [] : suggestions;
  const showLocationDropdown = showLocation && cities.length > 0;

  const submitSearch = useCallback(
    (searchQuery?: string) => {
      const q = (searchQuery ?? query).trim();
      if (!q) return;

      const params = new URLSearchParams({ q });
      if (showLocationDropdown && city && city !== ALL_TOWNS) {
        params.set("city", city);
      }

      setIsOpen(false);
      router.push(`/search?${params.toString()}`);
    },
    [query, city, router, showLocationDropdown]
  );

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(true);
      void fetchSuggestions(query).then((results) => {
        setSuggestions(results);
        setIsLoading(false);
        setActiveIndex(-1);
      });
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
    if (activeIndex >= 0 && visibleSuggestions[activeIndex]) {
      submitSearch(visibleSuggestions[activeIndex].text);
    } else {
      submitSearch();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || visibleSuggestions.length === 0) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((prev) =>
          prev < visibleSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : visibleSuggestions.length - 1
        );
        break;
      case "Enter":
        if (activeIndex >= 0 && visibleSuggestions[activeIndex]) {
          event.preventDefault();
          submitSearch(visibleSuggestions[activeIndex].text);
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
            suggestions={visibleSuggestions}
            query={query}
            isLoading={query.trim().length >= 2 && isLoading}
            isOpen={isOpen && query.trim().length >= 1}
            activeIndex={activeIndex}
            onSelect={(text) => {
              setQuery(text);
              submitSearch(text);
            }}
            onHover={setActiveIndex}
          />
        </div>

        {showLocationDropdown && (
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
                <SelectItem value={ALL_TOWNS}>All</SelectItem>
                {cities.map((location) => (
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
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </form>
  );
}
