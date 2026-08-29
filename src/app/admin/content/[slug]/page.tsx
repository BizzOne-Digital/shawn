import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { PageContentEditor } from "@/components/admin/page-content-editor";
import { getCmsPage } from "@/lib/content/cms-config";
import { getPageContent } from "@/lib/content/page-content";
import { Button } from "@/components/ui/button";

interface AdminContentEditPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminContentEditPage({
  params,
}: AdminContentEditPageProps) {
  const { slug } = await params;
  const page = getCmsPage(slug);
  if (!page) notFound();

  const content = await getPageContent(slug);

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/content">
            <ArrowLeft className="size-4" />
            All Pages
          </Link>
        </Button>
      </div>
      <PageHeader
        title={page.title}
        description={`Edit content for ${page.path}. Changes appear on the live site after saving.`}
      />
      <PageContentEditor page={page} initialContent={content} />
    </div>
  );
}
