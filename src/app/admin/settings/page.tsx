import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";

async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const setting = await db.siteSetting.findUnique({ where: { key } });
  if (!setting) return fallback;
  return setting.value as T;
}

export default async function SettingsPage() {
  const settings = {
    ad_minimum_daily_bid: await getSetting("ad_minimum_daily_bid", 0.25),
    ad_max_positions: await getSetting("ad_max_positions", 3),
    ad_approval_required: await getSetting("ad_approval_required", true),
    require_re_review: await getSetting("require_re_review", true),
    contact_email: await getSetting("contact_email", "admin@letsgobuffalo.com"),
    contact_phone: await getSetting("contact_phone", "716-559-5955"),
  };

  return (
    <div>
      <PageHeader title="Site Settings" description="Configure platform settings and contact info" />
      <SettingsForm settings={settings} />
    </div>
  );
}
