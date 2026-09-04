"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Building2,
  Megaphone,
  CreditCard,
  Settings,
  PlusCircle,
  LogOut,
  Menu,
  X,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { SiteLogo } from "@/components/layout/site-logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { UserRole } from "@prisma/client";

const businessNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/businesses", label: "My Businesses", icon: Building2 },
  { href: "/dashboard/submit", label: "Add Business", icon: PlusCircle },
  { href: "/dashboard/advertising", label: "Advertising", icon: Megaphone },
  { href: "/email-enrollment", label: "Custom Email", icon: Mail },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const individualNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/email-enrollment", label: "Custom Email", icon: Mail },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isIndividual = session?.user?.role === UserRole.INDIVIDUAL;
  const navItems = isIndividual ? individualNavItems : businessNavItems;

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-navy text-white rounded-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-navy text-white transform transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <SiteLogo
              href="/"
              width={160}
              height={53}
              imageClassName="h-10 w-auto"
            />
            <p className="text-white/60 text-xs mt-2">
              {isIndividual ? "Member Dashboard" : "Business Dashboard"}
            </p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <p className="text-white/60 text-xs truncate px-4 mb-2">
              {session?.user?.email}
            </p>
            <Button
              variant="ghost"
              className="w-full justify-start text-white/70 hover:text-white hover:bg-white/5"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="size-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
