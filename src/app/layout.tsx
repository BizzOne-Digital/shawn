import { type ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { metadata as siteMetadata } from "./metadata";
import { getPageContent, txt } from "@/lib/content/page-content";
import "./globals.css";

export const dynamic = "force-dynamic";
export const metadata = siteMetadata;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export default async function RootLayout({ children }: { children: ReactNode }) {
  const layoutContent = await getPageContent("layout");

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full overflow-x-clip`}>
      <body className="flex min-h-full min-w-0 flex-col overflow-x-clip antialiased">
        <Providers>
          <Header bannerText={txt(layoutContent, "header.banner")} />
          <main className="min-w-0 flex-1 overflow-x-clip">{children}</main>
          <Footer content={layoutContent} />
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
