"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Loader2, Send, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AudienceInfo {
  eligibleCount: number;
  pendingNewCount: number;
  sendStatusLabels: string[];
}

interface HistoryRow {
  id: string;
  subject: string;
  recipientCount: number;
  failedCount: number;
  status: string;
  sentAt: string | null;
  createdAt: string;
}

interface NewsletterComposerProps {
  initialAudience: AudienceInfo;
  initialHistory: HistoryRow[];
}

export function NewsletterComposer({ initialAudience, initialHistory }: NewsletterComposerProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState(initialAudience);
  const [history, setHistory] = useState(initialHistory);
  const [sending, setSending] = useState(false);
  const [approving, setApproving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/newsletters");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setAudience(data.audience);
      setHistory(data.history ?? []);
    } catch {
      toast.error("Unable to load newsletter data");
    }
  }, []);

  async function approvePending() {
    setApproving(true);
    try {
      const res = await fetch("/api/admin/newsletters/approve-pending", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast.success(`Marked ${data.updated} subscriber(s) as Contacted`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setApproving(false);
    }
  }

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      toast.error("Subject and message are required");
      return;
    }
    if (!window.confirm(`Send this newsletter to ${audience?.eligibleCount ?? 0} recipient(s)?`)) {
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/newsletters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), body: body.trim(), confirmSend: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Send failed");
      toast.success(`Sent to ${data.sent} recipient(s)${data.failed ? ` (${data.failed} failed)` : ""}`);
      setSubject("");
      setBody("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="border-dashed">
        <CardContent className="py-4 text-sm text-muted space-y-2">
          <p>
            Emails go to <strong className="text-navy">Newsletter</strong> signups (footer, homepage,
            registration) whose lead status is{" "}
            <strong className="text-navy">{audience?.sendStatusLabels.join(" or ")}</strong> in{" "}
            <strong className="text-navy">Admin → Leads</strong>.
          </p>
          <p>
            New signups start as <strong className="text-navy">New</strong> — use{" "}
            <strong>Approve pending subscribers</strong> below or change status manually before sending.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ready to email</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-navy">{audience?.eligibleCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pending (New)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-bold text-navy">{audience?.pendingNewCount ?? 0}</p>
            {(audience?.pendingNewCount ?? 0) > 0 && (
              <Button type="button" variant="outline" size="sm" disabled={approving} onClick={() => void approvePending()}>
                {approving ? <Loader2 className="animate-spin size-4" /> : <UserCheck className="size-4" />}
                Approve pending subscribers
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compose newsletter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nl-subject">Subject</Label>
            <Input
              id="nl-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="March updates from Let's Go Buffalo"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="nl-body">Message</Label>
            <Textarea
              id="nl-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              placeholder="Write your update here..."
              className="mt-1 font-mono text-sm"
            />
          </div>
          <Button
            type="button"
            variant="accent"
            disabled={sending || (audience?.eligibleCount ?? 0) === 0}
            onClick={() => void handleSend()}
          >
            {sending ? <Loader2 className="animate-spin" /> : <Send className="size-4" />}
            Send newsletter ({audience?.eligibleCount ?? 0} recipients)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send history</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted">No newsletters sent yet.</p>
          ) : (
            <ul className="space-y-3">
              {history.map((row) => (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-navy">{row.subject}</p>
                    <p className="text-xs text-muted">
                      {row.sentAt ? format(new Date(row.sentAt), "MMM d, yyyy h:mm a") : "—"}
                      {" · "}
                      {row.recipientCount} sent
                      {row.failedCount > 0 ? `, ${row.failedCount} failed` : ""}
                    </p>
                  </div>
                  <Badge variant={row.status === "SENT" ? "default" : row.status === "PARTIAL" ? "accent" : "destructive"}>
                    {row.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
