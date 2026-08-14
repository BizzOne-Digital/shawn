"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Check, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
}

interface ModerationActionsProps {
  businessId: string;
  categories: Category[];
  currentCategoryId?: string | null;
  currentSubcategoryId?: string | null;
}

export function ModerationActions({
  businessId,
  categories,
  currentCategoryId,
  currentSubcategoryId,
}: ModerationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [dialog, setDialog] = useState<"reject" | "changes" | null>(null);
  const [message, setMessage] = useState("");
  const [categoryId, setCategoryId] = useState(currentCategoryId ?? "");
  const [subcategoryId, setSubcategoryId] = useState(currentSubcategoryId ?? "");

  const selectedCategory = categories.find((c) => c.id === categoryId);

  async function handleApprove() {
    if (!categoryId) {
      toast.error("Please assign a category before publishing");
      return;
    }
    setLoading("approve");
    try {
      const res = await fetch(`/api/admin/moderation/${businessId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: categoryId || undefined, subcategoryId: subcategoryId || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to approve");
      }
      toast.success("Business approved and published");
      router.push("/admin/moderation");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    if (!message.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setLoading("reject");
    try {
      const res = await fetch(`/api/admin/moderation/${businessId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to reject");
      }
      toast.success("Business rejected");
      router.push("/admin/moderation");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setLoading(null);
      setDialog(null);
    }
  }

  async function handleRequestChanges() {
    if (!message.trim()) {
      toast.error("Please describe the required changes");
      return;
    }
    setLoading("changes");
    try {
      const res = await fetch(`/api/admin/moderation/${businessId}/request-changes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to request changes");
      }
      toast.success("Changes requested");
      router.push("/admin/moderation");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to request changes");
    } finally {
      setLoading(null);
      setDialog(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Assign Category *</Label>
          <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setSubcategoryId(""); }}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedCategory && selectedCategory.subcategories.length > 0 && (
          <div>
            <Label>Subcategory</Label>
            <Select value={subcategoryId} onValueChange={setSubcategoryId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                {selectedCategory.subcategories.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="accent"
          onClick={handleApprove}
          disabled={!!loading}
        >
          {loading === "approve" ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Check />
          )}
          Approve & Publish
        </Button>
        <Button
          variant="outline"
          onClick={() => { setDialog("changes"); setMessage(""); }}
          disabled={!!loading}
        >
          <MessageSquare />
          Request Changes
        </Button>
        <Button
          variant="destructive"
          onClick={() => { setDialog("reject"); setMessage(""); }}
          disabled={!!loading}
        >
          <X />
          Reject
        </Button>
      </div>

      <Dialog open={dialog === "reject"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>
              Provide a reason for rejection. This will be sent to the business owner.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Reason for rejection..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={loading === "reject"}>
              {loading === "reject" && <Loader2 className="animate-spin" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "changes"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Describe what changes are needed before approval.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Required changes..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={handleRequestChanges} disabled={loading === "changes"}>
              {loading === "changes" && <Loader2 className="animate-spin" />}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
