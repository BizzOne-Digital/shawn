import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { FaqManager } from "@/components/admin/faq-manager";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  const entries = await db.faqEntry.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="FAQ"
        description="Questions and answers shown on the public FAQ page (expand/collapse accordion)."
      />

      <Card className="mb-6 border-dashed">
        <CardContent className="py-4 text-sm text-muted">
          Visitors see published items at <strong className="text-navy">/faq</strong>. Links appear in the site header
          and footer.
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <FaqManager
            entries={entries.map((e) => ({
              id: e.id,
              question: e.question,
              answer: e.answer,
              sortOrder: e.sortOrder,
              isActive: e.isActive,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
