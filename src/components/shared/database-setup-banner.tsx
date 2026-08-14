import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DatabaseSetupBanner() {
  return (
    <div className="bg-buffalo-red/10 border-b border-buffalo-red/20">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <AlertTriangle className="size-5 text-buffalo-red flex-shrink-0 mt-0.5 sm:mt-0" />
        <div className="flex-1">
          <p className="font-semibold text-navy">Database not connected</p>
          <p className="text-sm text-muted mt-1">
            Start MongoDB (or open MongoDB Compass), then run{" "}
            <code className="bg-soft-gray px-1.5 py-0.5 rounded text-xs">npm run db:setup</code>{" "}
            to create tables and seed demo data.
          </p>
        </div>
        <Link href="/contact">
          <Button variant="outline" size="sm">Need Help?</Button>
        </Link>
      </div>
    </div>
  );
}
