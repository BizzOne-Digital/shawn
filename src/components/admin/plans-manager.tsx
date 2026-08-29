"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PlanRow {
  id: string;
  slug: string;
  name: string;
  memberType: string;
  monthlyPrice: number;
  yearlyPrice: number;
  isActive: boolean;
  isPreLaunchPricing: boolean;
}

interface PromoRow {
  id: string;
  code: string;
  type: string;
  value: number;
  redemptionCount: number;
  maxRedemptions: number | null;
  isActive: boolean;
  validUntil: string | null;
}

interface PlansManagerProps {
  plans: PlanRow[];
  promoCodes: PromoRow[];
}

export function PlansManager({ plans: initialPlans, promoCodes: initialPromos }: PlansManagerProps) {
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans);
  const [promos, setPromos] = useState(initialPromos);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ monthlyPrice: 0, yearlyPrice: 0, isActive: true });
  const [newPromo, setNewPromo] = useState({
    code: "",
    type: "PERCENTAGE",
    value: 10,
    maxRedemptions: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  function startEdit(plan: PlanRow) {
    setEditingId(plan.id);
    setEditForm({
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      isActive: plan.isActive,
    });
  }

  async function savePlan(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/plans/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Plan updated");
      setEditingId(null);
      router.refresh();
    } catch {
      toast.error("Failed to update plan");
    } finally {
      setLoading(false);
    }
  }

  async function createPromo(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPromo,
          maxRedemptions: newPromo.maxRedemptions ? parseInt(newPromo.maxRedemptions) : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed");
      }
      toast.success("Promo code created");
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
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="size-5" /> Membership Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {plans.map((plan) => (
            <div key={plan.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-navy">{plan.name}</h3>
                    <Badge variant="secondary">{plan.memberType}</Badge>
                    {plan.isPreLaunchPricing && (
                      <Badge className="bg-buffalo-red/10 text-buffalo-red">Pre-Launch</Badge>
                    )}
                    {!plan.isActive && <Badge variant="outline">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-muted mt-1">{plan.slug}</p>
                </div>
                {editingId !== plan.id ? (
                  <div className="flex items-center gap-4">
                    <span className="text-navy font-medium">
                      ${plan.monthlyPrice.toFixed(2)}/mo · ${plan.yearlyPrice.toFixed(0)}/yr
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => startEdit(plan)}>
                      <Pencil className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-end gap-3">
                    <div>
                      <Label className="text-xs">Monthly ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.monthlyPrice}
                        onChange={(e) => setEditForm({ ...editForm, monthlyPrice: parseFloat(e.target.value) || 0 })}
                        className="w-24 h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Yearly ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.yearlyPrice}
                        onChange={(e) => setEditForm({ ...editForm, yearlyPrice: parseFloat(e.target.value) || 0 })}
                        className="w-24 h-8"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editForm.isActive}
                        onCheckedChange={(v) => setEditForm({ ...editForm, isActive: v })}
                      />
                      <Label className="text-xs">Active</Label>
                    </div>
                    <Button size="sm" variant="accent" onClick={() => savePlan(plan.id)} disabled={loading}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="size-5" /> Promo Codes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={createPromo} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-soft-gray rounded-lg">
            <div>
              <Label>Code</Label>
              <Input
                value={newPromo.code}
                onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                placeholder="LAUNCH20"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={newPromo.type} onValueChange={(v) => setNewPromo({ ...newPromo, type: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage Off</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Fixed Amount Off</SelectItem>
                  <SelectItem value="FREE_TRIAL_DAYS">Free Trial Days</SelectItem>
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
              />
            </div>
            <div>
              <Label>Max Uses (optional)</Label>
              <Input
                type="number"
                value={newPromo.maxRedemptions}
                onChange={(e) => setNewPromo({ ...newPromo, maxRedemptions: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Input
                value={newPromo.description}
                onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="accent" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <Plus className="size-4" />}
                Create Code
              </Button>
            </div>
          </form>

          <div className="space-y-2">
            {promos.length === 0 ? (
              <p className="text-muted text-sm">No promo codes yet.</p>
            ) : (
              promos.map((promo) => (
                <div key={promo.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-mono font-semibold text-navy">{promo.code}</span>
                    <span className="text-sm text-muted ml-3">
                      {promo.type === "PERCENTAGE" && `${promo.value}% off`}
                      {promo.type === "FIXED_AMOUNT" && `$${promo.value} off`}
                      {promo.type === "FREE_TRIAL_DAYS" && `${promo.value} day trial`}
                    </span>
                    <span className="text-xs text-muted ml-3">
                      Used {promo.redemptionCount}{promo.maxRedemptions ? `/${promo.maxRedemptions}` : ""}
                    </span>
                  </div>
                  <Switch
                    checked={promo.isActive}
                    onCheckedChange={(v) => togglePromo(promo.id, v)}
                  />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
