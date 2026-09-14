"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function UserFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/admin/users?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4">
      <Input
        placeholder="Search by name or email..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-sm"
      />
      <Button type="submit">Search</Button>
      {searchParams.get("q") ? (
        <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
          Clear
        </Button>
      ) : null}
    </form>
  );
}
