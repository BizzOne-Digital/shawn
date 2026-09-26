import { PromoCodeScope } from "@prisma/client";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { EmailDiscountManager } from "@/components/admin/email-discount-manager";

export const dynamic = "force-dynamic";

export default async function AdminEmailDiscountsPage() {
  const promoCodes = await db.promoCode.findMany({
    where: { scope: PromoCodeScope.LGB_EMAIL },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Email Discount Codes"
        description="Generate promo codes for Custom Email (@LetsGoBuffalo.com) purchases and requests."
      />
      <EmailDiscountManager
        promoCodes={promoCodes.map((p) => ({
          id: p.id,
          code: p.code,
          type: p.type,
          value: Number(p.value),
          description: p.description,
          redemptionCount: p.redemptionCount,
          maxRedemptions: p.maxRedemptions,
          isActive: p.isActive,
          validUntil: p.validUntil?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
