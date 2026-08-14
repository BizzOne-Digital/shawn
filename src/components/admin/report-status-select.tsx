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
import type { ReportStatus } from "@prisma/client";

export function ReportStatusSelect({ reportId, status }: { reportId: string; status: ReportStatus }) {
  const router = useRouter();

  async function handleChange(newStatus: ReportStatus) {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Report updated");
      router.refresh();
    } catch {
      toast.error("Failed to update report");
    }
  }

  return (
    <Select value={status} onValueChange={(v) => handleChange(v as ReportStatus)}>
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"] as ReportStatus[]).map((s) => (
          <SelectItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
