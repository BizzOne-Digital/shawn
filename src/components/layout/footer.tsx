"use client";

import { type FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Mail, MapPin, Phone, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const footerNav = {
  explore: [
    { href: "/directory", label: "Business Directory" },
    { href: "/categories", label: "Categories" },
    { href: "/search", label: "Search" },
    { href: "/advertise", label: "Advertise" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
  ],
};

const socialLinks = [
  { href: "#", label: "Facebook", icon: Share2 },
  { href: "#", label: "Instagram", icon: Globe },
  { href: "#", label: "Twitter", icon: Share2 },
  { href: "#", label: "LinkedIn", icon: Globe },
];

export function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    authRoutes.some((route) => pathname.startsWith(route))
  ) {
    return null;
  }

  function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  }

  return (
    <footer className="overflow-x-clip bg-navy text-white">
      <div className="mx-auto max-w-7xl min-w-0 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo.png"
                alt="Let's Go Buffalo"
                width={240}
                height={80}
                className="h-16 w-auto object-contain sm:h-[4.75rem]"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
              Discover the best local businesses across Buffalo and Western New York.
              From restaurants to services, find trusted neighbors in your community.
            </p>
            <div className="mt-6 space-y-3 text-sm text-white/85">
              <a
                href="mailto:admin@letsgobuffalo.com"
                className="flex items-center gap-2 transition-colors hover:text-white"
              >
                <Mail className="size-4 shrink-0 text-buffalo-red" />
                admin@letsgobuffalo.com
              </a>
              <a
                href="tel:7165595955"
                className="flex items-center gap-2 transition-colors hover:text-white"
              >
                <Phone className="size-4 shrink-0 text-buffalo-red" />
                716-559-5955
              </a>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-buffalo-red" />
                <span>Buffalo, New York</span>
              </p>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-3">
            <div>
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
                Explore
              </h3>
              <ul className="mt-4 space-y-2">
                {footerNav.explore.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/75 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
                Company
              </h3>
              <ul className="mt-4 space-y-2">
                {footerNav.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/75 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
                Follow Us
              </h3>
              <div className="mt-4 flex gap-2">
                {socialLinks.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-white/85 transition-colors hover:bg-buffalo-red hover:text-white"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              Newsletter
            </h3>
            <p className="mt-4 text-sm text-white/75">
              Get local business highlights and community updates delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="mt-4 space-y-2">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/30"
              />
              <Button type="submit" variant="accent" className="w-full">
                Subscribe
              </Button>
              {subscribed && (
                <p className="text-xs text-green-300">Thanks for subscribing!</p>
              )}
            </form>
          </div>
        </div>

        <div
          className={cn(
            "mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-8 sm:flex-row"
          )}
        >
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} Let&apos;s Go Buffalo. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/terms" className="text-white/60 transition-colors hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="text-white/60 transition-colors hover:text-white">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
