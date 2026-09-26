"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PromoRow {
  id: string;
  code: string;
  type: string;
  value: number;
  description: string | null;
  redemptionCount: number;
  maxRedemptions: number | null;
  isActive: boolean;
  validUntil: string | null;
}

export function EmailDiscountManager({ promoCodes }: { promoCodes: PromoRow[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: "",
    type: "PERCENTAGE",
    value: 10,
    maxRedemptions: "",
    description: "",
  });

  async function createPromo(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPromo,
          scope: "LGB_EMAIL",
          maxRedemptions: newPromo.maxRedemptions ? parseInt(newPromo.maxRedemptions, 10) : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed");
      }
      toast.success("Email discount code created");
      setNewPromo({ code: "", type: "PERCENTAGE", value: 10, maxRedemptions: "", description: "" });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function togglePromo(id: string, isActive: boolean) {
    await fetch(`/api/admin/promo-codes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardContent className="py-4 text-sm text-muted">
          Codes apply to <strong className="text-navy">Custom Email (@LetsGoBuffalo.com)</strong> requests.
          Customers enter a code on the email enrollment form; it is stored on the lead for billing. Membership
          plan codes stay under <strong className="text-navy">Plans &amp; Pricing</strong>.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="size-5" /> Generate email discount code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createPromo} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label>Code</Label>
              <Input
                value={newPromo.code}
                onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                placeholder="EMAIL20"
                required
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={newPromo.type} onValueChange={(v) => setNewPromo({ ...newPromo, type: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage off</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Fixed amount off ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input
                type="number"
                value={newPromo.value}
                onChange={(e) => setNewPromo({ ...newPromo, value: parseFloat(e.target.value) || 0 })}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label>Max uses (optional)</Label>
              <Input
                type="number"
                value={newPromo.maxRedemptions}
                onChange={(e) => setNewPromo({ ...newPromo, maxRedemptions: e.target.value })}
                className="mt-1"
                placeholder="Unlimited"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Description (internal)</Label>
              <Input
                value={newPromo.description}
                onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                className="mt-1"
                placeholder="Launch promo for custom email"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="accent" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <Plus className="size-4" />}
                Create code
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="size-5" /> Active &amp; past email codes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {promoCodes.length === 0 ? (
            <p className="text-sm text-muted">No email discount codes yet.</p>
          ) : (
            promoCodes.map((promo) => (
              <div key={promo.id} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                <div>
                  <span className="font-mono font-semibold text-navy">{promo.code}</span>
                  <span className="text-sm text-muted ml-3">
                    {promo.type === "PERCENTAGE" && `${promo.value}% off`}
                    {promo.type === "FIXED_AMOUNT" && `$${promo.value} off`}
                  </span>
                  {promo.description ? (
                    <p className="text-xs text-muted mt-1">{promo.description}</p>
                  ) : null}
                  <p className="text-xs text-muted mt-1">
                    Used {promo.redemptionCount}
                    {promo.maxRedemptions ? `/${promo.maxRedemptions}` : ""}
                  </p>
                </div>
                <Switch checked={promo.isActive} onCheckedChange={(v) => void togglePromo(promo.id, v)} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
