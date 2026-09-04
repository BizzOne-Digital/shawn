import { BusinessListingTier, type MembershipPlan } from "@prisma/client";
import { DEFAULT_PLANS, getPlanLimits, type PlanLimits } from "@/lib/services/membership";

export function isProListingTier(tier: BusinessListingTier): boolean {
  return tier === BusinessListingTier.PRO || tier === BusinessListingTier.SELLER;
}

export function getDefaultLimitsForTier(tier: BusinessListingTier): PlanLimits {
  const match = DEFAULT_PLANS.find(
    (plan) => "businessTier" in plan && plan.businessTier === tier
  );
  if (match) {
    return match as unknown as PlanLimits;
  }
  return DEFAULT_PLANS[0] as unknown as PlanLimits;
}

export function getLimitsForPlan(plan: MembershipPlan | PlanLimits | null | undefined) {
  if (!plan) {
    return getPlanLimits(getDefaultLimitsForTier(BusinessListingTier.FREE_BASIC));
  }
  return getPlanLimits(plan);
}

export function getLimitsForBusinessTier(tier: BusinessListingTier) {
  return getPlanLimits(getDefaultLimitsForTier(tier));
}

/** Wizard step indices — keep in sync with STEP_LABELS in validations/business.ts */
export const WIZARD_STEP = {
  BASIC: 0,
  CATEGORY: 1,
  DESCRIPTION: 2,
  LOCATION: 3,
  SOCIAL: 4,
  HOURS: 5,
  IMAGES: 6,
  PRO_EXTRAS: 7,
  PREVIEW: 8,
  SUBMIT: 9,
} as const;

export function getWizardStepFlow(tier: BusinessListingTier): number[] {
  if (isProListingTier(tier)) {
    return [
      WIZARD_STEP.BASIC,
      WIZARD_STEP.CATEGORY,
      WIZARD_STEP.DESCRIPTION,
      WIZARD_STEP.LOCATION,
      WIZARD_STEP.SOCIAL,
      WIZARD_STEP.HOURS,
      WIZARD_STEP.IMAGES,
      WIZARD_STEP.PRO_EXTRAS,
      WIZARD_STEP.PREVIEW,
      WIZARD_STEP.SUBMIT,
    ];
  }

  return [
    WIZARD_STEP.BASIC,
    WIZARD_STEP.CATEGORY,
    WIZARD_STEP.DESCRIPTION,
    WIZARD_STEP.LOCATION,
    WIZARD_STEP.PREVIEW,
    WIZARD_STEP.SUBMIT,
  ];
}
