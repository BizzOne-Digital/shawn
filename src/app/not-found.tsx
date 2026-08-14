"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="font-display text-8xl font-bold text-navy/10">404</div>
      <h1 className="font-display text-3xl md:text-4xl font-bold text-navy -mt-6">
        Page Not Found
      </h1>
      <p className="mt-4 text-muted text-lg max-w-md">
        Looks like this page wandered off somewhere outside the 716. The business or
        page you&apos;re looking for may have moved or no longer exists.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Link href="/">
          <Button variant="default">
            <Home className="size-4" />
            Back to Home
          </Button>
        </Link>
        <Link href="/directory">
          <Button variant="outline">
            <Search className="size-4" />
            Browse Directory
          </Button>
        </Link>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
          Go Back
        </Button>
      </div>
    </div>
  );
}
