import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Let's Go Buffalo | Discover Local Businesses in Western New York",
    template: "%s | Let's Go Buffalo",
  },
  description:
    "Find and support the best local businesses, restaurants, services, and places in Buffalo and Western New York. List your business and grow with Let's Go Buffalo.",
  keywords: [
    "Buffalo businesses",
    "Western New York directory",
    "local businesses Buffalo NY",
    "Buffalo restaurants",
    "WNY services",
  ],
  authors: [{ name: "Let's Go Buffalo" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://letsgobuffalo.com",
    siteName: "Let's Go Buffalo",
    title: "Let's Go Buffalo | Discover Local Businesses",
    description: "Find and support local businesses in Buffalo and Western New York.",
    images: [{ url: "/images/logo.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Let's Go Buffalo",
    description: "Discover local businesses in Buffalo and Western New York.",
    images: ["/images/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootMetadataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
