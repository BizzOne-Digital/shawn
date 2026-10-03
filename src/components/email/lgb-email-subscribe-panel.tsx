"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TermsAcceptanceCheckbox } from "@/components/forms/terms-acceptance-checkbox";

type Pricing = {
  monthlyPrice: number;
  yearlyPrice: number;
};

export function LgbEmailSubscribePanel() {
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loadingInterval, setLoadingInterval] = useState<"MONTHLY" | "YEARLY" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/public/lgb-email/pricing")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.monthlyPrice != null) {
          setPricing({
            monthlyPrice: data.monthlyPrice,
            yearlyPrice: data.yearlyPrice,
          });
        }
      })
      .catch(() => {});
  }, []);

  async function startCheckout(interval: "MONTHLY" | "YEARLY") {
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Enter the email address you use for contact (we'll send receipts here).");
      return;
    }
    if (!acceptTerms) {
      setError("Please agree to the Terms & Conditions to continue.");
      return;
    }

    setLoadingInterval(interval);
    try {
      const res = await fetch("/api/public/lgb-email/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          name: name.trim() || undefined,
          interval,
          acceptTerms: true,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not start checkout. Please try again.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("Could not start checkout. Please try again.");
    } catch {
      setError("Could not start checkout. Please try again.");
    } finally {
      setLoadingInterval(null);
    }
  }

  const monthly = pricing?.monthlyPrice ?? 0.99;
  const yearly = pricing?.yearlyPrice ?? 9.99;

  return (
    <div className="mt-10 rounded-2xl border border-buffalo-red/25 bg-buffalo-red/5 p-6" id="subscribe">
      <h2 className="font-display text-xl font-bold text-navy">Pay for your @LetsGoBuffalo.com email</h2>
      <p className="mt-2 text-sm text-muted">
        You do <strong className="text-navy">not</strong> need a site membership or login. This subscription is
        only for your custom address with forwarding. After payment, submit your preferred address below — our team
        will verify your request and activate your inbox.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lgb-pay-email">Contact email</Label>
          <Input
            id="lgb-pay-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lgb-pay-name">Name (optional)</Label>
          <Input
            id="lgb-pay-name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4">
        <TermsAcceptanceCheckbox checked={acceptTerms} onCheckedChange={setAcceptTerms} />
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <Button
          type="button"
          variant="accent"
          disabled={loadingInterval !== null}
          onClick={() => startCheckout("MONTHLY")}
        >
          {loadingInterval === "MONTHLY" ? <Loader2 className="size-4 animate-spin" /> : null}
          Pay ${monthly.toFixed(2)}/month
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={loadingInterval !== null}
          onClick={() => startCheckout("YEARLY")}
        >
          {loadingInterval === "YEARLY" ? <Loader2 className="size-4 animate-spin" /> : null}
          Pay ${yearly.toFixed(2)}/year
        </Button>
      </div>

      <p className="mt-4 text-xs text-muted">
        Already have an account? You can also{" "}
        <Link href="/login?callbackUrl=%2Fdashboard%2Fsubscribe" className="text-buffalo-red underline">
          subscribe from your dashboard
        </Link>
        .
      </p>
    </div>
  );
}
