"use client";

import { useState } from "react";
import { LgbEmailRequestForm } from "@/components/forms/lgb-email-request-form";
import { LgbEmailSubscribePanel } from "@/components/email/lgb-email-subscribe-panel";
import type { LgbEmailCheckoutContext } from "@/lib/lgb-email-enrollment-types";

export function LgbEmailEnrollmentSection() {
  const [checkoutContext, setCheckoutContext] = useState<LgbEmailCheckoutContext | null>(null);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  function handleRequestSuccess(context: LgbEmailCheckoutContext) {
    setCheckoutContext(context);
    setRequestSubmitted(true);
    requestAnimationFrame(() => {
      document.getElementById("subscribe")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <>
      <LgbEmailRequestForm onRequestSuccess={handleRequestSuccess} />
      <LgbEmailSubscribePanel
        checkoutContext={checkoutContext}
        requestSubmitted={requestSubmitted}
      />
    </>
  );
}
