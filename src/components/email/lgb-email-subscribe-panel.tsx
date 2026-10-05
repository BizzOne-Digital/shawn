"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TermsAcceptanceCheckbox } from "@/components/forms/terms-acceptance-checkbox";
import type { LgbEmailCheckoutContext } from "@/lib/lgb-email-enrollment-types";
import { redirectToLgbEmailCheckout } from "@/lib/lgb-email-checkout-client";

type Pricing = {
  monthlyPrice: number;
  yearlyPrice: number;
};

type Props = {
  checkoutContext: LgbEmailCheckoutContext | null;
  requestSubmitted: boolean;
};

export function LgbEmailSubscribePanel({ checkoutContext, requestSubmitted }: Props) {
  const [pricing, setPricing] = useState<Pricing | null>(null);
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

    if (!checkoutContext?.leadId) {
      setError("Submit your address request above first, then complete payment here.");
      return;
    }
    if (!acceptTerms) {
      setError("Please agree to the Terms & Conditions to continue.");
      return;
    }

    setLoadingInterval(interval);
    try {
      const result = await redirectToLgbEmailCheckout({
        email: checkoutContext.email,
        name: checkoutContext.name || undefined,
        leadId: checkoutContext.leadId,
        interval,
      });
      if (!result.ok) {
        setError(result.error);
      }
    } catch {
      setError("Could not start checkout. Please try again.");
    } finally {
      setLoadingInterval(null);
    }
  }

  const monthly = pricing?.monthlyPrice ?? 0.99;
  const yearly = pricing?.yearlyPrice ?? 9.99;
  const canPay = Boolean(checkoutContext?.leadId);

  return (
    <div
      className="mt-8 rounded-2xl border border-buffalo-red/25 bg-buffalo-red/5 p-6"
      id="subscribe"
    >
      <h2 className="font-display text-xl font-bold text-navy">Complete your subscription</h2>
      <p className="mt-2 text-sm text-muted">
        No site membership or login required — this is only for your custom @LetsGoBuffalo.com address with
        forwarding. After you send your request above, pay monthly or annually here. Our team receives the request and
        payment together, then verifies and activates your inbox.
      </p>

      {requestSubmitted && checkoutContext ? (
        <p className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
          Request sent for admin review. Complete payment below to finish — we&apos;ll match it to your requested
          address.
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted">
          Fill out the form above and click <strong className="text-navy">Send request</strong> or{" "}
          <strong className="text-navy">Send request &amp; pay</strong> to continue.
        </p>
      )}

      <div className="mt-4">
        <TermsAcceptanceCheckbox checked={acceptTerms} onCheckedChange={setAcceptTerms} />
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <Button
          type="button"
          variant="accent"
          disabled={!canPay || loadingInterval !== null}
          onClick={() => startCheckout("MONTHLY")}
        >
          {loadingInterval === "MONTHLY" ? <Loader2 className="size-4 animate-spin" /> : null}
          Pay ${monthly.toFixed(2)}/month
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!canPay || loadingInterval !== null}
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
