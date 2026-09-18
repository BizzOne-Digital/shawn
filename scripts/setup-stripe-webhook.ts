/**
 * Ensures a Stripe webhook endpoint exists for production checkout completion.
 * Run: npx tsx scripts/setup-stripe-webhook.ts
 */
import { config } from "dotenv";
import Stripe from "stripe";

config();

const EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
];

async function main() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    console.error("Missing STRIPE_SECRET_KEY");
    process.exit(1);
  }

  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    process.env.AUTH_URL?.replace(/\/$/, "") ??
    "";
  if (!base || base.includes("localhost")) {
    console.error(
      "Set NEXT_PUBLIC_SITE_URL to your live site (e.g. https://lets-go-buffalo.vercel.app) before running this script."
    );
    process.exit(1);
  }

  const url = `${base}/api/billing/webhook`;
  const stripe = new Stripe(key);

  const existing = await stripe.webhookEndpoints.list({ limit: 100 });
  const match = existing.data.find((ep) => ep.url === url);

  if (match) {
    console.log("Webhook endpoint already exists:", match.id);
    console.log("URL:", match.url);
    console.log(
      "\nIf you lost the signing secret, create a new endpoint in Stripe Dashboard or delete this one and re-run."
    );
    return;
  }

  const endpoint = await stripe.webhookEndpoints.create({
    url,
    enabled_events: EVENTS,
    description: "Let's Go Buffalo — subscriptions and wallet top-ups",
  });

  console.log("Created webhook endpoint:", endpoint.id);
  console.log("URL:", endpoint.url);
  console.log("\nAdd this to Vercel and local .env as STRIPE_WEBHOOK_SECRET:");
  console.log(endpoint.secret);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
