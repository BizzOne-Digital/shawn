"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

export function EmailEnrollmentStatusBanner() {
  const searchParams = useSearchParams();
  const subscribed = searchParams.get("subscribed") === "1";
  const cancelled = searchParams.get("cancelled") === "1";

  if (!subscribed && !cancelled) {
    return null;
  }

  if (subscribed) {
    return (
      <div
        className="mx-auto max-w-5xl min-w-0 px-4 pt-8 sm:px-6 lg:px-8"
        role="status"
        aria-live="polite"
      >
        <div className="flex gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-900">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" aria-hidden />
          <div>
            <p className="font-semibold">You&apos;re subscribed — thank you!</p>
            <p className="mt-1 text-sm text-green-800">
              We received your payment. Complete the form below with your preferred @LetsGoBuffalo.com address and
              forwarding details. Our team will verify everything and activate your email.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl min-w-0 px-4 pt-8 sm:px-6 lg:px-8" role="status">
      <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
        <XCircle className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden />
        <p className="text-sm">
          Checkout was cancelled. You can try again anytime using the pay buttons below, or submit a request if you
          already paid elsewhere.
        </p>
      </div>
    </div>
  );
}
