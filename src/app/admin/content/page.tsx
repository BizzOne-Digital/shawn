import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { listCmsPages } from "@/lib/content/page-content";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminContentPage() {
  const pages = listCmsPages();

  return (
    <div>
      <PageHeader
        title="Page Content"
        description="Edit text content for every section on each public page"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Link key={page.slug} href={`/admin/content/${page.slug}`}>
            <Card className="h-full transition-colors hover:border-buffalo-red/40 hover:bg-soft-gray/50">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-buffalo-red/10 text-buffalo-red">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy">{page.title}</p>
                  <p className="text-sm text-muted">{page.path}</p>
                  <p className="mt-1 text-xs text-muted">
                    {page.sectionCount} sections
                  </p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-muted" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
