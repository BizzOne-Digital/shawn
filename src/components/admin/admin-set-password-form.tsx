"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminSetPasswordFormProps {
  userId: string;
  userEmail: string;
}

export function AdminSetPasswordForm({ userId, userEmail }: AdminSetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to set password");
      toast.success(`Password updated for ${userEmail}`);
      setPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to set password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-lg border border-border p-3">
      <Label htmlFor={`password-${userId}`} className="flex items-center gap-1 text-xs">
        <KeyRound className="size-3" />
        Set password (support backup)
      </Label>
      <Input
        id={`password-${userId}`}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        minLength={6}
        autoComplete="new-password"
      />
      <Button type="submit" size="sm" variant="outline" disabled={loading} className="w-full">
        {loading ? <Loader2 className="animate-spin" /> : "Update Password"}
      </Button>
    </form>
  );
}
