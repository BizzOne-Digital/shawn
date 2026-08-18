"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ClipboardCheck,
  Building2,
  Tags,
  MapPin,
  Users,
  Megaphone,
  Mail,
  Flag,
  BarChart3,
  Settings,
  ScrollText,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { SiteLogo } from "@/components/layout/site-logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/moderation", label: "Moderation", icon: ClipboardCheck },
  { href: "/admin/businesses", label: "Businesses", icon: Building2 },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/locations", label: "Locations", icon: MapPin },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/plans", label: "Plans & Pricing", icon: Tags },
  { href: "/admin/leads", label: "Leads", icon: Mail },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
];

interface AdminSidebarProps {
  userName?: string | null;
  userRole?: string;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export function AdminSidebar({
  userName,
  userRole,
  mobileOpen,
  onMobileOpenChange,
}: AdminSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 rounded-lg bg-navy p-2 text-white lg:hidden"
        onClick={() => onMobileOpenChange(!mobileOpen)}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => onMobileOpenChange(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col border-r border-border bg-navy text-white transition-transform lg:static lg:translate-x-0 lg:shrink-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4">
          <SiteLogo
            href="/admin"
            width={140}
            height={47}
            invert
            comClassName="text-white"
            imageClassName="h-auto w-auto max-h-10"
          />
          <p className="mt-2 text-xs uppercase tracking-wider text-white/60">Admin Panel</p>
        </div>

        <Separator className="bg-white/10" />

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onMobileOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-buffalo-red text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-white/10 p-4">
          {userName && (
            <div className="text-sm">
              <p className="truncate font-medium">{userName}</p>
              <p className="text-xs capitalize text-white/60">
                {userRole?.toLowerCase().replace("_", " ")}
              </p>
            </div>
          )}
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
            onClick={() => onMobileOpenChange(false)}
          >
            <ExternalLink className="h-4 w-4" />
            View Site
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-white/20 bg-transparent text-white hover:bg-white/10"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
}
