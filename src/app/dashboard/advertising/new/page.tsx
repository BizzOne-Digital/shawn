"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { campaignSchema } from "@/lib/validations/business";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

type CampaignForm = z.infer<typeof campaignSchema>;

interface Business {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [minimumDailyBid, setMinimumDailyBid] = useState(0.25);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CampaignForm>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      categoryIds: [],
      startDate: new Date(),
      dailyBid: 0.25,
    },
  });

  useEffect(() => {
    fetch("/api/businesses")
      .then((r) => r.json())
      .then((data) => {
        const eligible = data.filter(
          (b: { status: string }) => b.status === "APPROVED" || b.status === "PUBLISHED"
        );
        setBusinesses(eligible);
      });

    fetch("/api/public/categories")
      .then((r) => r.json())
      .then((data: { categories?: Category[] }) => setCategories(data.categories ?? []));

    fetch("/api/billing/wallet")
      .then((r) => r.json())
      .then((data: { balance?: number }) => setWalletBalance(Number(data.balance ?? 0)));

    fetch("/api/public/ad-settings")
      .then((r) => r.json())
      .then((data: { minimumDailyBid?: number }) => {
        const minBid = Number(data.minimumDailyBid ?? 0.25);
        setMinimumDailyBid(minBid);
        setValue("dailyBid", minBid);
      });
  }, [setValue]);

  function toggleCategory(categoryId: string) {
    setSelectedCategories((prev) => {
      const next = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId];
      setValue("categoryIds", next, { shouldValidate: true });
      return next;
    });
  }

  async function onSubmit(data: CampaignForm) {
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to create campaign");
        return;
      }
      const created = json.created ?? 1;
      if (created === 1 && json.campaigns?.[0]?.id) {
        toast.success("Category bid created!");
        router.push(`/dashboard/advertising/${json.campaigns[0].id}`);
      } else {
        toast.success(`Created ${created} category bids at $${data.dailyBid.toFixed(2)}/day each`);
        router.push("/dashboard/advertising");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const selectedCategoryCount = selectedCategories.length || 0;
  const bidAmount = Number(watch("dailyBid")) || minimumDailyBid;
  const estimatedDailyTotal =
    selectedCategoryCount > 0 ? bidAmount * selectedCategoryCount : bidAmount;
  const hasEnoughBalance =
    walletBalance === null || walletBalance >= estimatedDailyTotal;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/dashboard/advertising">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </Link>
        <h1 className="font-display text-3xl font-bold text-navy">Create Category Bid</h1>
        <p className="text-muted mt-1">
          Bidding is per category, not site-wide. Select one or more categories — each gets its own
          daily bid starting at ${minimumDailyBid.toFixed(2)}/day.
        </p>
      </div>

      {walletBalance !== null && !hasEnoughBalance && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-sm text-amber-900">
            Your wallet balance (${walletBalance.toFixed(2)}) is below the estimated daily total
            (${estimatedDailyTotal.toFixed(2)} for {selectedCategoryCount || 1} categor
            {selectedCategoryCount === 1 ? "y" : "ies"}).
            {" "}
            <Link href="/dashboard/billing" className="font-medium underline">
              Add funds
            </Link>{" "}
            or ask an admin to add advertising credit to your account.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Campaign Name</Label>
              <Input id="name" {...register("name")} className="mt-1" />
              {errors.name && (
                <p className="text-sm text-buffalo-red mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label>Business</Label>
              <Select
                value={watch("businessId")}
                onValueChange={(v) => setValue("businessId", v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a business" />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.businessId && (
                <p className="text-sm text-buffalo-red mt-1">{errors.businessId.message}</p>
              )}
            </div>

            <div>
              <Label>Categories to bid on</Label>
              <p className="text-xs text-muted mt-1 mb-3">
                Each category is a separate bid — you only compete within that category, not across
                the whole site. Select as many categories as you want; we create one bid per category
                at the daily amount below.
              </p>
              {categories.length === 0 ? (
                <p className="text-sm text-muted">No categories available yet. Ask an admin to add categories.</p>
              ) : (
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex cursor-pointer items-center gap-3 text-sm"
                    >
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
              )}
              {errors.categoryIds && (
                <p className="text-sm text-buffalo-red mt-1">{errors.categoryIds.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="dailyBid">Daily Bid per Category ($)</Label>
                <Input
                  id="dailyBid"
                  type="number"
                  step="0.01"
                  min={minimumDailyBid}
                  {...register("dailyBid")}
                  className="mt-1"
                />
                <p className="text-xs text-muted mt-1">
                  Minimum ${minimumDailyBid.toFixed(2)} per category per day
                  {walletBalance !== null && (
                    <> · Wallet balance: ${walletBalance.toFixed(2)}</>
                  )}
                  {selectedCategoryCount > 0 && (
                    <>
                      {" "}
                      · Estimated daily total: ${estimatedDailyTotal.toFixed(2)} (
                      {selectedCategoryCount} categor{selectedCategoryCount === 1 ? "y" : "ies"})
                    </>
                  )}
                </p>
                {errors.dailyBid && (
                  <p className="text-sm text-buffalo-red mt-1">{errors.dailyBid.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="totalBudget">Total Budget ($)</Label>
                <Input id="totalBudget" type="number" step="0.01" {...register("totalBudget")} className="mt-1" />
                <p className="text-xs text-muted mt-1">Optional spending cap</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate", {
                    setValueAs: (v) => (v ? new Date(v) : new Date()),
                  })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date (optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate", {
                    setValueAs: (v) => (v ? new Date(v) : undefined),
                  })}
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              disabled={
                loading ||
                categories.length === 0 ||
                selectedCategoryCount === 0 ||
                !hasEnoughBalance
              }
            >
              {loading && <Loader2 className="animate-spin" />}
              Create Category Bid{selectedCategoryCount > 1 ? "s" : ""}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
