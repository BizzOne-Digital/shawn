"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { normalizeLocalPart } from "@/lib/services/lgb-email-reserved";

interface ReservedEmailManagerProps {
  initialLocalParts: string[];
}

export function ReservedEmailManager({ initialLocalParts }: ReservedEmailManagerProps) {
  const router = useRouter();
  const [localParts, setLocalParts] = useState(initialLocalParts);
  const [newPart, setNewPart] = useState("");
  const [loading, setLoading] = useState(false);

  async function save(next: string[]) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/reserved-emails", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ localParts: next }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      const data = await res.json();
      setLocalParts(data.localParts ?? next);
      toast.success("Reserved email list updated");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  function addPart() {
    const normalized = normalizeLocalPart(newPart);
    if (!normalized) {
      toast.error("Enter an email name to block");
      return;
    }
    if (localParts.includes(normalized)) {
      toast.error("That name is already on the list");
      return;
    }
    const next = [...localParts, normalized].sort((a, b) => a.localeCompare(b));
    setNewPart("");
    void save(next);
  }

  function removePart(part: string) {
    void save(localParts.filter((entry) => entry !== part));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reserved @LetsGoBuffalo.com Names</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted">
          Names on this list show as unavailable during email enrollment (for example admin, ez, shawn).
          Names under 5 characters are always blocked automatically.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <Label htmlFor="reserved-email-part">Add blocked name</Label>
            <Input
              id="reserved-email-part"
              value={newPart}
              onChange={(e) => setNewPart(e.target.value)}
              placeholder="admin"
              className="mt-1"
              disabled={loading}
            />
          </div>
          <Button type="button" variant="secondary" className="sm:self-end" onClick={addPart} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Plus className="size-4" />}
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {localParts.length === 0 ? (
            <p className="text-sm text-muted">No reserved names yet.</p>
          ) : (
            localParts.map((part) => (
              <Badge key={part} variant="secondary" className="gap-2 py-1.5 pl-3 pr-1">
                {part}
                <button
                  type="button"
                  className="rounded p-1 hover:bg-black/10"
                  onClick={() => removePart(part)}
                  disabled={loading}
                  aria-label={`Remove ${part}`}
                >
                  <Trash2 className="size-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
