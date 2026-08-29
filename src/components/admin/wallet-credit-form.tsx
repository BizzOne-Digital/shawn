"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WalletCreditFormProps {
  userId: string;
  userName: string | null;
  userEmail: string;
  currentBalance: number;
  campaignId?: string;
  defaultNote?: string;
  triggerLabel?: string;
}

export function WalletCreditForm({
  userId,
  userName,
  userEmail,
  currentBalance,
  campaignId,
  defaultNote = "",
  triggerLabel = "Add Credit",
}: WalletCreditFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState(defaultNote);
  const [loading, setLoading] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setNote(defaultNote);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed < 0.01) {
      toast.error("Enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsed,
          note: note || undefined,
          campaignId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to add credit");
      }

      toast.success(`Added $${parsed.toFixed(2)} to wallet`);
      setOpen(false);
      setAmount("");
      setNote("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add credit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <DollarSign className="size-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add advertising wallet credit</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted">
          {userName ?? userEmail} · Current balance:{" "}
          <span className="font-medium text-navy">${currentBalance.toFixed(2)}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor={`amount-${userId}`}>Amount ($)</Label>
            <Input
              id={`amount-${userId}`}
              type="number"
              step="0.01"
              min="0.01"
              placeholder="25.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`note-${userId}`}>Note (optional)</Label>
            <Input
              id={`note-${userId}`}
              placeholder="Advertising credit for launch promo"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button type="submit" variant="accent" disabled={loading} className="w-full">
            {loading ? <Loader2 className="animate-spin" /> : "Add to Wallet"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
