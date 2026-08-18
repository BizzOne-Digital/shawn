"use client";

import { cn } from "@/lib/utils";

export function PasswordRequirements({ className }: { className?: string }) {
  return (
    <ul className={cn("mt-2 space-y-1 text-xs text-muted", className)}>
      <li>• At least 8 characters</li>
      <li>• At least one uppercase letter (A–Z)</li>
      <li>• At least one number (0–9)</li>
    </ul>
  );
}
