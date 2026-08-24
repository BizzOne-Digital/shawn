"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LayoutDashboard, LogOut, MapPin, Menu } from "lucide-react";

import { SiteLogo } from "@/components/layout/site-logo";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/directory", label: "Discover" },
  { href: "/directory", label: "Categories" },
  { href: "/community", label: "Fan Page" },
  { href: "/gear", label: "Gear" },
  { href: "/email-enrollment", label: "LGB Email" },
  { href: "/advertise", label: "Advertise" },
  { href: "/#how-it-works", label: "How It Works" },
];

export function Header({ bannerText }: { bannerText?: string }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const reducedMotion = useReducedMotion() ?? false;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isAuthenticated = status === "authenticated" && session?.user;

  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/admin-login"];
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    authRoutes.some((route) => pathname.startsWith(route))
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full overflow-x-clip">
      <div className="bg-buffalo-red px-4 py-2 text-center text-sm font-medium text-white">
        <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <MapPin className="size-4 shrink-0" />
          {bannerText ?? "Explore local. Support Buffalo. Grow together."}
        </span>
      </div>

      <div
        className={cn(
          "border-b border-border/70 bg-white transition-shadow duration-300",
          scrolled && "shadow-md"
        )}
      >
        <div className="mx-auto flex h-[80px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 sm:h-[84px]">
          <SiteLogo href="/" width={200} height={60} priority imageClassName="h-14 w-auto sm:h-16" />

          <nav
            className="hidden items-center gap-1 xl:flex"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => {
              const active =
                link.href.startsWith("/#")
                  ? false
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "text-buffalo-red"
                      : "text-navy/80 hover:text-navy"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" className="text-navy" asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-navy"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="size-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-navy/80 transition-colors hover:text-navy"
                >
                  Sign In
                </Link>
                <Button variant="accent" size="sm" className="rounded-lg px-5" asChild>
                  <Link href="/register">List Your Business</Link>
                </Button>
              </>
            )}
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-navy lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs border-navy-light bg-navy text-white">
              <SheetHeader>
                <SheetTitle className="text-white">Menu</SheetTitle>
              </SheetHeader>
              <AnimatePresence>
                {mobileOpen && (
                  <motion.nav
                    initial={reducedMotion ? false : { opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, x: 16 }}
                    transition={{ duration: reducedMotion ? 0 : 0.25 }}
                    className="mt-8 flex flex-col gap-1"
                    aria-label="Mobile navigation"
                  >
                    {navLinks.map((link, index) => (
                      <motion.div
                        key={`${link.href}-${link.label}`}
                        initial={reducedMotion ? false : { opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: reducedMotion ? 0 : index * 0.05,
                          duration: reducedMotion ? 0 : 0.2,
                        }}
                      >
                        <Link
                          href={link.href}
                          className={cn(
                            "block rounded-lg px-3 py-3 text-base font-medium transition-colors",
                            pathname === link.href
                              ? "bg-white/15 text-white"
                              : "text-white/85 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    ))}

                    <motion.div
                      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: reducedMotion ? 0 : navLinks.length * 0.05 + 0.1,
                        duration: reducedMotion ? 0 : 0.2,
                      }}
                      className="mt-6 flex flex-col gap-2 border-t border-white/15 pt-6"
                    >
                      {isAuthenticated ? (
                        <>
                          <Button variant="secondary" asChild className="w-full">
                            <Link href="/dashboard">Dashboard</Link>
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full border-white/30 bg-transparent text-white hover:bg-white/10"
                            onClick={() => signOut({ callbackUrl: "/" })}
                          >
                            Logout
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="secondary" asChild className="w-full">
                            <Link href="/login">Sign In</Link>
                          </Button>
                          <Button variant="accent" asChild className="w-full">
                            <Link href="/register">List Your Business</Link>
                          </Button>
                        </>
                      )}
                    </motion.div>
                  </motion.nav>
                )}
              </AnimatePresence>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
