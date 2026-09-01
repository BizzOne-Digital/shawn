import { type ReactNode } from "react";
import { requireDashboardUser } from "@/lib/auth-utils";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireDashboardUser();

  return (
    <div className="min-h-screen overflow-x-clip bg-soft-gray">
      <DashboardNav />
      <div className="min-w-0 lg:pl-64">
        <div className="mx-auto max-w-6xl p-4 pt-16 sm:p-6 lg:p-8 lg:pt-8">
          {children}
        </div>
      </div>
    </div>
  );
}
