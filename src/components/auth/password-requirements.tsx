"use client";

import { cn } from "@/lib/utils";

export function PasswordRequirements({ className }: { className?: string }) {
  return (
    <ul className={cn("mt-2 space-y-1 text-xs text-muted", className)}>
      <li>• At least 6 characters</li>
    </ul>
  );
}
