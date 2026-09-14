"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "lgb-cookie-consent";

const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function notifyConsentChange() {
  listeners.forEach((listener) => listener());
}

function getConsentNeeded() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) !== "accepted";
  } catch {
    return true;
  }
}

function getServerConsentNeeded() {
  return false;
}

export function CookieConsentBanner() {
  const visible = useSyncExternalStore(subscribe, getConsentNeeded, getServerConsentNeeded);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      /* ignore */
    }
    notifyConsentChange();
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white p-4 shadow-lg md:p-5"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          We use cookies and similar technologies to run the site, remember preferences, and understand
          how visitors use Let&apos;s Go Buffalo. See our{" "}
          <Link href="/privacy" className="font-medium text-navy underline-offset-2 hover:underline">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
        <Button type="button" variant="default" size="sm" className="shrink-0" onClick={accept}>
          Accept
        </Button>
      </div>
    </div>
  );
}
