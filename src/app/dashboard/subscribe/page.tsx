"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  memberType: string;
}

interface Business {
  id: string;
  name: string;
  listingTier: string;
}

export default function SubscribePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planSlug = searchParams.get("plan") ?? "business-pro";
  const preselectedBusinessId = searchParams.get("businessId") ?? "";

  const [plan, setPlan] = useState<Plan | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessId, setBusinessId] = useState(preselectedBusinessId);
  const [interval, setInterval] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/public/plans?slug=${encodeURIComponent(planSlug)}`).then((r) => r.json()),
      fetch("/api/businesses").then((r) => r.json()),
    ])
      .then(([planData, businessData]) => {
        setPlan(planData.plan ?? null);
        const list = Array.isArray(businessData) ? businessData : [];
        setBusinesses(list);
        if (!businessId && list[0]?.id) {
          setBusinessId(list[0].id);
        }
      })
      .catch(() => toast.error("Failed to load subscription details"))
      .finally(() => setLoading(false));
  }, [planSlug, preselectedBusinessId]);

  async function handleCheckout() {
    if (!plan) return;
    if (plan.memberType === "BUSINESS" && !businessId) {
      toast.error("Select a business to upgrade");
      return;
    }

    setCheckingOut(true);
    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planSlug: plan.slug,
          interval,
          businessId: plan.memberType === "BUSINESS" ? businessId : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Checkout failed");
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      toast.error("Stripe checkout URL missing");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-buffalo-red" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="space-y-4 text-center py-16">
        <p className="text-muted">Plan not found.</p>
        <Link href="/pricing">
          <Button variant="outline">View Pricing</Button>
        </Link>
      </div>
    );
  }

  const monthly = Number(plan.monthlyPrice);
  const yearly = Number(plan.yearlyPrice);
  const price = interval === "MONTHLY" ? monthly : yearly;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link href="/pricing">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="size-4" />
          Back to pricing
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Subscribe to {plan.name}</CardTitle>
          <CardDescription>{plan.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="space-y-2">
            {(plan.features ?? []).map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-muted">
                <CheckCircle className="mt-0.5 size-4 text-buffalo-red" />
                {feature}
              </li>
            ))}
          </ul>

          {plan.memberType === "BUSINESS" && (
            <div>
              <Label>Business to upgrade</Label>
              <Select value={businessId} onValueChange={setBusinessId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a business" />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((business) => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.name} ({business.listingTier === "PRO" ? "Pro" : "Free"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {businesses.length === 0 && (
                <p className="mt-2 text-sm text-muted">
                  <Link href="/dashboard/submit" className="text-buffalo-red hover:underline">
                    Create a business listing
                  </Link>{" "}
                  first, then return here to upgrade.
                </p>
              )}
            </div>
          )}

          <div>
            <Label>Billing interval</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={interval === "MONTHLY" ? "accent" : "outline"}
                onClick={() => setInterval("MONTHLY")}
              >
                ${monthly.toFixed(2)}/month
              </Button>
              <Button
                type="button"
                variant={interval === "YEARLY" ? "accent" : "outline"}
                onClick={() => setInterval("YEARLY")}
              >
                ${yearly.toFixed(0)}/year
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-soft-gray p-4 text-center">
            <p className="text-sm text-muted">Due today</p>
            <p className="text-3xl font-bold text-navy">${price.toFixed(2)}</p>
            <p className="text-xs text-muted mt-1">Secure payment via Stripe</p>
          </div>

          <Button
            variant="accent"
            className="w-full"
            disabled={checkingOut || (plan.memberType === "BUSINESS" && !businessId)}
            onClick={handleCheckout}
          >
            {checkingOut ? <Loader2 className="animate-spin" /> : "Continue to Stripe Checkout"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
