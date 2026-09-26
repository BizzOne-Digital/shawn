import { PageHeader } from "@/components/admin/page-header";
import { NewsletterComposer } from "@/components/admin/newsletter-composer";
import { getNewsletterAdminData } from "@/lib/newsletter-admin-data";

export const dynamic = "force-dynamic";

export default async function AdminNewslettersPage() {
  const { audience, history } = await getNewsletterAdminData();

  return (
    <div>
      <PageHeader
        title="Newsletters"
        description="Email site updates to newsletter subscribers (SMTP required on production)."
      />
      <NewsletterComposer initialAudience={audience} initialHistory={history} />
    </div>
  );
}
