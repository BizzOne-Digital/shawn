"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsFormProps {
  settings: {
    ad_minimum_daily_bid: number;
    ad_max_positions: number;
    ad_approval_required: boolean;
    require_re_review: boolean;
    contact_email: string;
    contact_phone: string;
  };
}

export function SettingsForm({ settings: initial }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initial);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      toast.success("Settings saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader><CardTitle>Advertising Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ad_minimum_daily_bid">Minimum Daily Bid ($)</Label>
            <Input
              id="ad_minimum_daily_bid"
              type="number"
              step="0.01"
              min="0"
              value={form.ad_minimum_daily_bid}
              onChange={(e) => setForm({ ...form, ad_minimum_daily_bid: parseFloat(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="ad_max_positions">Sponsored Positions</Label>
            <Input
              id="ad_max_positions"
              type="number"
              min="1"
              max="10"
              value={form.ad_max_positions}
              onChange={(e) => setForm({ ...form, ad_max_positions: parseInt(e.target.value) || 1 })}
              className="mt-1"
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={form.ad_approval_required}
              onCheckedChange={(v) => setForm({ ...form, ad_approval_required: v })}
            />
            <Label>Require campaign approval</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={form.require_re_review}
              onCheckedChange={(v) => setForm({ ...form, require_re_review: v })}
            />
            <Label>Require re-review on edits</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input
              id="contact_phone"
              value={form.contact_phone}
              onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" variant="accent" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <Save />}
        Save Settings
      </Button>
    </form>
  );
}
