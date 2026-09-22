"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FaqRow {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

export function FaqManager({ entries: initial }: { entries: FaqRow[] }) {
  const router = useRouter();
  const [entries, setEntries] = useState(initial);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "" });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create");
      }
      const created = await res.json();
      setEntries((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
      setForm({ question: "", answer: "" });
      toast.success("FAQ added");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function saveEntry(id: string, patch: Partial<FaqRow>) {
    try {
      const res = await fetch(`/api/admin/faq/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updated } : e)).sort((a, b) => a.sortOrder - b.sortOrder)
      );
      router.refresh();
    } catch {
      toast.error("Failed to save FAQ");
    }
  }

  async function deleteEntry(id: string) {
    if (!confirm("Delete this FAQ item?")) return;
    try {
      const res = await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("FAQ deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete FAQ");
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="accent" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add FAQ
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add FAQ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="faq-q">Question</Label>
              <Input
                id="faq-q"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="faq-a">Answer</Label>
              <Textarea
                id="faq-a"
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                required
                rows={5}
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button type="submit" variant="accent" disabled={loading}>
                {loading && <Loader2 className="animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {entries.length === 0 ? (
        <p className="text-sm text-muted">No FAQ items yet. Add questions visitors can expand on the public FAQ page.</p>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted">Order</Label>
                  <Input
                    type="number"
                    className="w-20 h-8"
                    value={entry.sortOrder}
                    onChange={(e) =>
                      setEntries((prev) =>
                        prev.map((x) =>
                          x.id === entry.id ? { ...x, sortOrder: parseInt(e.target.value, 10) || 0 } : x
                        )
                      )
                    }
                    onBlur={() => saveEntry(entry.id, { sortOrder: entry.sortOrder })}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={entry.isActive}
                      onCheckedChange={(v) => {
                        setEntries((prev) =>
                          prev.map((x) => (x.id === entry.id ? { ...x, isActive: v } : x))
                        );
                        void saveEntry(entry.id, { isActive: v });
                      }}
                    />
                    Published
                  </label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => void deleteEntry(entry.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs">Question</Label>
                <Input
                  value={entry.question}
                  onChange={(e) =>
                    setEntries((prev) =>
                      prev.map((x) => (x.id === entry.id ? { ...x, question: e.target.value } : x))
                    )
                  }
                  onBlur={() => saveEntry(entry.id, { question: entry.question })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Answer</Label>
                <Textarea
                  value={entry.answer}
                  rows={4}
                  onChange={(e) =>
                    setEntries((prev) =>
                      prev.map((x) => (x.id === entry.id ? { ...x, answer: e.target.value } : x))
                    )
                  }
                  onBlur={() => saveEntry(entry.id, { answer: entry.answer })}
                  className="mt-1"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
