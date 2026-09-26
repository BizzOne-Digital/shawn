import { PromoCodeScope } from "@prisma/client";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { PlansManager } from "@/components/admin/plans-manager";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  const [plans, promoCodes] = await Promise.all([
    db.membershipPlan.findMany({ orderBy: { sortOrder: "asc" } }),
    db.promoCode.findMany({
      where: { scope: PromoCodeScope.MEMBERSHIP },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Plans & Pricing"
        description="Manage membership tiers, Stripe price IDs, and pricing shown on the public /pricing page"
      />
      <PlansManager
        plans={plans.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          memberType: p.memberType,
          monthlyPrice: Number(p.monthlyPrice),
          yearlyPrice: Number(p.yearlyPrice),
          isActive: p.isActive,
          isPreLaunchPricing: p.isPreLaunchPricing,
          stripeMonthlyPriceId: p.stripeMonthlyPriceId,
          stripeYearlyPriceId: p.stripeYearlyPriceId,
        }))}
        promoCodes={promoCodes.map((p) => ({
          id: p.id,
          code: p.code,
          type: p.type,
          value: Number(p.value),
          redemptionCount: p.redemptionCount,
          maxRedemptions: p.maxRedemptions,
          isActive: p.isActive,
          validUntil: p.validUntil?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
