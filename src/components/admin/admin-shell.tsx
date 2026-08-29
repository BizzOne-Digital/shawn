"use client";

import { useState, type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";

interface AdminShellProps {
  userName?: string | null;
  userRole?: string;
  children: ReactNode;
}

export function AdminShell({ userName, userRole, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-soft-gray">
      <AdminSidebar
        userName={userName}
        userRole={userRole}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        <div className="p-4 pt-16 sm:p-6 lg:p-8 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
