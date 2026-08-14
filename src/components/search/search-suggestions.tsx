"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Clock, Search, TrendingUp } from "lucide-react";

import { cn, highlightText } from "@/lib/utils";

export interface SearchSuggestion {
  text: string;
  type?: "business" | "query" | "category";
}

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  query: string;
  isLoading?: boolean;
  isOpen: boolean;
  activeIndex: number;
  onSelect: (suggestion: string) => void;
  onHover: (index: number) => void;
  className?: string;
}

function SuggestionIcon({ type }: { type?: SearchSuggestion["type"] }) {
  switch (type) {
    case "business":
      return <Building2 className="size-4 shrink-0 text-navy" />;
    case "category":
      return <TrendingUp className="size-4 shrink-0 text-buffalo-red" />;
    default:
      return <Clock className="size-4 shrink-0 text-muted" />;
  }
}

export function SearchSuggestions({
  suggestions,
  query,
  isLoading = false,
  isOpen,
  activeIndex,
  onSelect,
  onHover,
  className,
}: SearchSuggestionsProps) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const activeItem = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    activeItem?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-background shadow-lg",
        className
      )}
      role="listbox"
      aria-label="Search suggestions"
    >
      {isLoading ? (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted">
          <Search className="size-4 animate-pulse" />
          Searching...
        </div>
      ) : suggestions.length === 0 ? (
        <div className="px-4 py-3 text-sm text-muted">
          {query.length >= 2 ? "No suggestions found" : "Type at least 2 characters"}
        </div>
      ) : (
        <ul ref={listRef} className="max-h-72 overflow-y-auto py-1">
          {suggestions.map((suggestion, index) => (
            <li key={`${suggestion.text}-${index}`} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                  index === activeIndex
                    ? "bg-soft-gray text-navy"
                    : "text-foreground hover:bg-soft-gray"
                )}
                onMouseEnter={() => onHover(index)}
                onClick={() => onSelect(suggestion.text)}
              >
                <SuggestionIcon type={suggestion.type} />
                <span
                  dangerouslySetInnerHTML={{
                    __html: highlightText(suggestion.text, query),
                  }}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
