"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LeadStatus } from "@prisma/client";

export function LeadStatusSelect({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const router = useRouter();

  async function handleChange(newStatus: LeadStatus) {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Lead status updated");
      router.refresh();
    } catch {
      toast.error("Failed to update lead");
    }
  }

  return (
    <Select value={status} onValueChange={(v) => handleChange(v as LeadStatus)}>
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED", "SPAM"] as LeadStatus[]).map((s) => (
          <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
