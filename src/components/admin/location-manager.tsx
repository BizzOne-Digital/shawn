"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface LocationRow {
  id: string;
  city: string;
  state: string;
  region: string;
  zipCode: string | null;
  slug: string;
  isActive: boolean;
  businessCount: number;
}

export function LocationManager({ locations: initial }: { locations: LocationRow[] }) {
  const router = useRouter();
  const [locations, setLocations] = useState(initial);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ city: "", state: "NY", zipCode: "", region: "Western New York" });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create");
      }
      const created = await res.json();
      setLocations((prev) => [
        ...prev,
        {
          id: created.id,
          city: created.city,
          state: created.state,
          region: created.region,
          zipCode: created.zipCode ?? null,
          slug: created.slug,
          isActive: created.isActive ?? true,
          businessCount: 0,
        },
      ]);
      setForm({ city: "", state: "NY", zipCode: "", region: "Western New York" });
      toast.success("Location created");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      const res = await fetch(`/api/admin/locations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setLocations((prev) => prev.map((l) => l.id === id ? { ...l, isActive } : l));
      toast.success("Location updated");
    } catch {
      toast.error("Failed to update location");
    }
  }

  return (
    <>
      <Button variant="accent" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Location
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Location</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1" required />
            </div>
            <div>
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>ZIP Code</Label>
              <Input value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} className="mt-1" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="mt-6 space-y-3">
        {locations.map((loc) => (
          <div key={loc.id} className="flex items-center justify-between rounded-lg border border-border p-4 bg-background">
            <div>
              <p className="font-medium">{loc.city}, {loc.state}</p>
              <p className="text-sm text-muted">{loc.region} · {loc.businessCount} businesses</p>
            </div>
            <Switch checked={loc.isActive} onCheckedChange={(v) => toggleActive(loc.id, v)} />
          </div>
        ))}
      </div>
    </>
  );
}
