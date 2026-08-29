"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2, Trash2, X } from "lucide-react";
import { FanCommentStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FanCommentActionsProps {
  commentId: string;
  status: FanCommentStatus;
}

export function FanCommentActions({ commentId, status }: FanCommentActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(nextStatus: FanCommentStatus) {
    setLoading(nextStatus);
    try {
      const res = await fetch(`/api/admin/fan-comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update comment");
      }
      toast.success(
        nextStatus === FanCommentStatus.APPROVED
          ? "Comment approved"
          : nextStatus === FanCommentStatus.REJECTED
            ? "Comment rejected"
            : "Comment updated"
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(null);
    }
  }

  async function deleteComment() {
    if (!confirm("Delete this comment permanently?")) return;
    setLoading("delete");
    try {
      const res = await fetch(`/api/admin/fan-comments/${commentId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete comment");
      }
      toast.success("Comment deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge
        variant={
          status === FanCommentStatus.APPROVED
            ? "default"
            : status === FanCommentStatus.REJECTED
              ? "destructive"
              : "secondary"
        }
      >
        {status.toLowerCase()}
      </Badge>
      {status !== FanCommentStatus.APPROVED && (
        <Button
          size="sm"
          variant="outline"
          disabled={!!loading}
          onClick={() => updateStatus(FanCommentStatus.APPROVED)}
        >
          {loading === FanCommentStatus.APPROVED ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          Approve
        </Button>
      )}
      {status !== FanCommentStatus.REJECTED && (
        <Button
          size="sm"
          variant="outline"
          disabled={!!loading}
          onClick={() => updateStatus(FanCommentStatus.REJECTED)}
        >
          {loading === FanCommentStatus.REJECTED ? (
            <Loader2 className="animate-spin" />
          ) : (
            <X className="size-4" />
          )}
          Reject
        </Button>
      )}
      <Button size="sm" variant="ghost" disabled={!!loading} onClick={deleteComment}>
        {loading === "delete" ? <Loader2 className="animate-spin" /> : <Trash2 className="size-4" />}
      </Button>
    </div>
  );
}
