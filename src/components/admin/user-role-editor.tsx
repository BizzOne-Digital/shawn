"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { UserRole } from "@prisma/client";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export function UserRoleEditor({ user }: { user: UserRow }) {
  const router = useRouter();
  const [role, setRole] = useState(user.role);
  const [isActive, setIsActive] = useState(user.isActive);
  const [loading, setLoading] = useState(false);

  async function update(updates: { role?: UserRole; isActive?: boolean }) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update");
      }
      toast.success("User updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Select
        value={role}
        onValueChange={(v) => {
          setRole(v as UserRole);
          update({ role: v as UserRole });
        }}
        disabled={loading}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(["VISITOR", "BUSINESS_OWNER", "MODERATOR", "ADMIN"] as UserRole[]).map((r) => (
            <SelectItem key={r} value={r}>{r.replace(/_/g, " ")}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center gap-2">
        <Switch
          checked={isActive}
          onCheckedChange={(v) => {
            setIsActive(v);
            update({ isActive: v });
          }}
          disabled={loading}
        />
        <span className="text-sm text-muted">{isActive ? "Active" : "Inactive"}</span>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>
    </div>
  );
}
