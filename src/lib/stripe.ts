import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeSecretKey(): string | undefined {
  return process.env.STRIPE_SECRET_KEY?.trim() || undefined;
}

export function getStripeWebhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || undefined;
}

export function isStripeConfigured(): boolean {
  return Boolean(getStripeSecretKey());
}

export function isStripeWebhookConfigured(): boolean {
  return isStripeConfigured() && Boolean(getStripeWebhookSecret());
}

export function isStripeLiveMode(): boolean {
  const key = getStripeSecretKey();
  return Boolean(key?.startsWith("sk_live_"));
}

export function getStripeClient(): Stripe {
  const key = getStripeSecretKey();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export const STRIPE_WEBHOOK_EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
];

export function getStripeCheckoutBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    process.env.AUTH_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  return base;
}
