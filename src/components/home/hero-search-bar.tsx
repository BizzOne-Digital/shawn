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
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SearchSuggestions,
  type SearchSuggestion,
} from "@/components/search/search-suggestions";
import { cn } from "@/lib/utils";

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
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const submitSearch = useCallback(
    (searchQuery?: string) => {
      const q = (searchQuery ?? query).trim();
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      setIsOpen(false);
      router.push(params.toString() ? `/search?${params.toString()}` : "/search");
    },
    [query, router]
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
        className="relative flex overflow-hidden rounded-2xl border border-border/60 bg-white shadow-2xl"
      >
        <div className="relative min-w-0 flex-1">
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
            placeholder="What are you looking for? Try a business, service, or town..."
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

        <Button
          type="submit"
          variant="accent"
          className="h-14 shrink-0 rounded-none px-6 text-base font-semibold sm:px-8"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
