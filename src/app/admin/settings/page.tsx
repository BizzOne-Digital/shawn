import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { ReservedEmailManager } from "@/components/admin/reserved-email-manager";
import { getReservedLgbEmailLocalParts } from "@/lib/services/lgb-email-reserved";
import { getCurrentUser } from "@/lib/auth-utils";
import { isFullAdmin } from "@/lib/admin-permissions";

async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const setting = await db.siteSetting.findUnique({ where: { key } });
  if (!setting) return fallback;
  return setting.value as T;
}

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const fullAdmin = user ? isFullAdmin(user.role) : false;

  const [settings, reservedEmailLocalParts] = await Promise.all([
    fullAdmin
      ? Promise.resolve({
          ad_minimum_daily_bid: await getSetting("ad_minimum_daily_bid", 0.25),
          ad_max_positions: await getSetting("ad_max_positions", 3),
          ad_approval_required: await getSetting("ad_approval_required", true),
          require_re_review: await getSetting("require_re_review", true),
          contact_email: await getSetting("contact_email", "admin@letsgobuffalo.com"),
          contact_phone: await getSetting("contact_phone", "716-559-5955"),
        })
      : Promise.resolve(null),
    getReservedLgbEmailLocalParts(),
  ]);

  return (
    <div>
      <PageHeader
        title="Site Settings"
        description={
          fullAdmin
            ? "Configure platform settings and contact info"
            : "Manage reserved @LetsGoBuffalo.com names (moderator access)"
        }
      />
      <div className="space-y-6">
        {fullAdmin && settings ? <SettingsForm settings={settings} /> : null}
        <ReservedEmailManager initialLocalParts={reservedEmailLocalParts} />
      </div>
    </div>
  );
}
