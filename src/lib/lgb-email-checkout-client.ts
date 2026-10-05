export async function redirectToLgbEmailCheckout(options: {
  email: string;
  name?: string;
  leadId: string;
  interval: "MONTHLY" | "YEARLY";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch("/api/public/lgb-email/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: options.email,
      name: options.name,
      leadId: options.leadId,
      interval: options.interval,
      acceptTerms: true,
    }),
  });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    return { ok: false, error: data.error ?? "Could not start checkout. Please try again." };
  }
  window.location.href = data.url;
  return { ok: true };
}
