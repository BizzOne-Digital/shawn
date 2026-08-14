"use client";

import { BusinessCard, type BusinessCardData } from "@/components/business/business-card";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

interface BusinessGridProps {
  businesses: BusinessCardData[];
  variant?: "grid" | "list";
  className?: string;
  columns?: 2 | 3 | 4;
}

const columnClasses = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export function BusinessGrid({
  businesses,
  variant = "grid",
  className,
  columns = 3,
}: BusinessGridProps) {
  if (businesses.length === 0) {
    return (
      <p className="py-12 text-center text-muted">
        No businesses found. Try adjusting your search.
      </p>
    );
  }

  if (variant === "list") {
    return (
      <StaggerContainer className={cn("flex flex-col gap-4", className)}>
        {businesses.map((business) => (
          <StaggerItem key={business.id}>
            <BusinessCard business={business} variant="list" />
          </StaggerItem>
        ))}
      </StaggerContainer>
    );
  }

  return (
    <StaggerContainer
      className={cn(
        "grid gap-6 grid-cols-1",
        columnClasses[columns],
        className
      )}
    >
      {businesses.map((business) => (
        <StaggerItem key={business.id}>
          <BusinessCard business={business} variant="grid" />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
