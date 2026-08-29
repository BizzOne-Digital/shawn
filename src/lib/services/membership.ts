import {
  BusinessListingTier,
  IndividualMemberTier,
  MemberType,
  MembershipPlan,
} from "@prisma/client";

/** Default pre-launch pricing from client outline */
export const DEFAULT_PLANS = [
  {
    slug: "business-free-basic",
    name: "Free Basic Listing",
    memberType: MemberType.BUSINESS,
    businessTier: BusinessListingTier.FREE_BASIC,
    description: "Company name, one-sentence description, and website link.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    sortOrder: 1,
    maxImages: 0,
    maxDescriptionChars: 120,
    allowsVideo: false,
    allowsCoupon: false,
    allowsSocialLinks: false,
    allowsSearchKeywords: false,
    allowsLgbEmail: false,
    allowsSellerProducts: false,
    maxSellerProducts: 0,
    features: [
      "Company name",
      "Limited description (1 sentence)",
      "Website link",
      "Username & password access",
    ],
  },
  {
    slug: "business-pro",
    name: "Pro Listing",
    memberType: MemberType.BUSINESS,
    businessTier: BusinessListingTier.PRO,
    description: "Full listing with media, promotions, social links, and search keywords.",
    monthlyPrice: 4.99,
    yearlyPrice: 49,
    sortOrder: 2,
    maxImages: 2,
    maxDescriptionChars: 5000,
    allowsVideo: true,
    allowsCoupon: true,
    allowsSocialLinks: true,
    allowsSearchKeywords: true,
    allowsLgbEmail: true,
    allowsSellerProducts: false,
    maxSellerProducts: 0,
    features: [
      "Everything in Free Basic",
      "Full description",
      "Coupon & discount/promo code",
      "2 images + video",
      "LetsGoBuffalo email account",
      "Keyword identifier in search",
      "Facebook, Instagram, X & social links",
      "Pre-launch pricing: $4.99/mo or $49/yr",
    ],
  },
  {
    slug: "business-seller",
    name: "Seller Listing",
    memberType: MemberType.BUSINESS,
    businessTier: BusinessListingTier.SELLER,
    description: "Showcase goods for sale with pricing linked to your store.",
    monthlyPrice: 3.99,
    yearlyPrice: 39,
    sortOrder: 3,
    maxImages: 10,
    maxDescriptionChars: 5000,
    allowsVideo: false,
    allowsCoupon: true,
    allowsSocialLinks: true,
    allowsSearchKeywords: true,
    allowsLgbEmail: false,
    allowsSellerProducts: true,
    maxSellerProducts: 10,
    features: [
      "Product showcase (up to 10 items)",
      "Pricing linked to your purchase platform",
      "Pre-launch pricing: $3.99/mo or $39/yr",
    ],
  },
  {
    slug: "individual-free",
    name: "Individual (Free)",
    memberType: MemberType.INDIVIDUAL,
    individualTier: IndividualMemberTier.FREE,
    description: "Community access and local deal updates.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    sortOrder: 4,
    maxImages: 0,
    maxDescriptionChars: 0,
    allowsVideo: false,
    allowsCoupon: false,
    allowsSocialLinks: false,
    allowsSearchKeywords: false,
    allowsLgbEmail: false,
    allowsSellerProducts: false,
    maxSellerProducts: 0,
    features: [
      "Community blog access",
      "Promotions, events & contests updates",
      "Discounts from participating businesses",
    ],
  },
  {
    slug: "individual-pro",
    name: "Individual Pro",
    memberType: MemberType.INDIVIDUAL,
    individualTier: IndividualMemberTier.PRO,
    description: "Premium individual membership with LGB email and extra perks.",
    monthlyPrice: 0.99,
    yearlyPrice: 9.99,
    sortOrder: 5,
    maxImages: 0,
    maxDescriptionChars: 0,
    allowsVideo: false,
    allowsCoupon: false,
    allowsSocialLinks: false,
    allowsSearchKeywords: false,
    allowsLgbEmail: true,
    allowsSellerProducts: false,
    maxSellerProducts: 0,
    features: [
      "Everything in Individual Free",
      "yourname@LetsGoBuffalo.com email with forwarding",
      "Additional discounts on gear & offerings",
      "Pre-launch pricing: $0.99/mo or $9.99/yr",
    ],
  },
] as const;

export type PlanLimits = Pick<
  MembershipPlan,
  | "maxImages"
  | "maxDescriptionChars"
  | "allowsVideo"
  | "allowsCoupon"
  | "allowsSocialLinks"
  | "allowsSearchKeywords"
  | "allowsLgbEmail"
  | "allowsSellerProducts"
  | "maxSellerProducts"
  | "businessTier"
  | "individualTier"
>;

export function getPlanLimits(plan: PlanLimits) {
  return {
    maxImages: plan.maxImages,
    maxDescriptionChars: plan.maxDescriptionChars,
    allowsVideo: plan.allowsVideo,
    allowsCoupon: plan.allowsCoupon,
    allowsSocialLinks: plan.allowsSocialLinks,
    allowsSearchKeywords: plan.allowsSearchKeywords,
    allowsLgbEmail: plan.allowsLgbEmail,
    allowsSellerProducts: plan.allowsSellerProducts,
    maxSellerProducts: plan.maxSellerProducts,
  };
}

export function canUseFeature(
  plan: PlanLimits,
  feature: keyof ReturnType<typeof getPlanLimits>
): boolean {
  const limits = getPlanLimits(plan);
  const value = limits[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  return false;
}

export function formatPlanPrice(monthly: number, yearly: number): string {
  if (monthly === 0 && yearly === 0) return "Free";
  if (monthly > 0 && yearly > 0) {
    return `$${monthly.toFixed(2)}/mo · $${yearly.toFixed(0)}/yr`;
  }
  return `$${monthly.toFixed(2)}/mo`;
}

export function tierLabel(tier: BusinessListingTier): string {
  const labels: Record<BusinessListingTier, string> = {
    FREE_BASIC: "Free Basic",
    PRO: "Pro",
    SELLER: "Seller",
  };
  return labels[tier];
}
