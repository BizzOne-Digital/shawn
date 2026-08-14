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

export default function NewCampaignPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CampaignForm>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      targetType: "ALL",
      startDate: new Date(),
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
  }, []);

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
      toast.success("Campaign created!");
      router.push(`/dashboard/advertising/${json.id}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/dashboard/advertising">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </Link>
        <h1 className="font-display text-3xl font-bold text-navy">Create Campaign</h1>
        <p className="text-muted mt-1">Promote your business in search results</p>
      </div>

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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="dailyBid">Daily Bid ($)</Label>
                <Input id="dailyBid" type="number" step="0.01" {...register("dailyBid")} className="mt-1" />
                {errors.dailyBid && (
                  <p className="text-sm text-buffalo-red mt-1">{errors.dailyBid.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="totalBudget">Total Budget ($)</Label>
                <Input id="totalBudget" type="number" step="0.01" {...register("totalBudget")} className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" {...register("startDate")} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="endDate">End Date (optional)</Label>
                <Input id="endDate" type="date" {...register("endDate")} className="mt-1" />
              </div>
            </div>

            <Button type="submit" variant="accent" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              Create Campaign
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
