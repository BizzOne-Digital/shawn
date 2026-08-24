"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Phone, Share2 } from "lucide-react";

import { SiteLogo } from "@/components/layout/site-logo";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { cn } from "@/lib/utils";
import type { PageContentMap } from "@/lib/content/content-text";
import { txt } from "@/lib/content/content-text";

const footerNav = {
  explore: [
    { href: "/directory", label: "Business Directory" },
    { href: "/community", label: "Community Fan Page" },
    { href: "/gear", label: "Gear Shop" },
    { href: "/lgb-email", label: "@LetsGoBuffalo Email" },
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
  { href: "#", label: "Instagram", icon: Share2 },
  { href: "#", label: "Twitter", icon: Share2 },
  { href: "#", label: "LinkedIn", icon: Share2 },
];

interface FooterProps {
  content?: PageContentMap;
}

export function Footer({ content = {} }: FooterProps) {
  const pathname = usePathname();

  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    authRoutes.some((route) => pathname.startsWith(route))
  ) {
    return null;
  }

  const email = txt(content, "footer.email");
  const phone = txt(content, "footer.phone");

  return (
    <footer className="overflow-x-clip bg-navy text-white">
      <div className="mx-auto max-w-7xl min-w-0 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SiteLogo
              href="/"
              width={240}
              height={80}
              imageClassName="h-16 w-auto sm:h-[4.75rem]"
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
              {txt(content, "footer.tagline")}
            </p>
            <div className="mt-6 space-y-3 text-sm text-white/85">
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 transition-colors hover:text-white"
              >
                <Mail className="size-4 shrink-0 text-buffalo-red" />
                {email}
              </a>
              <a
                href={`tel:${phone.replace(/\D/g, "")}`}
                className="flex items-center gap-2 transition-colors hover:text-white"
              >
                <Phone className="size-4 shrink-0 text-buffalo-red" />
                {phone}
              </a>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-buffalo-red" />
                <span>{txt(content, "footer.location")}</span>
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
              {txt(content, "footer.newsletter_text")}
            </p>
            <NewsletterForm className="mt-4 [&_input]:border-white/20 [&_input]:bg-white/10 [&_input]:text-white [&_input]:placeholder:text-white/50" />
          </div>
        </div>

        <div
          className={cn(
            "mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-8 sm:flex-row"
          )}
        >
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} {txt(content, "footer.copyright")}
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
