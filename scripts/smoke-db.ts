/**
 * Runs Prisma queries used by admin/public pages to catch schema/runtime DB errors.
 */
import { PromoCodeScope } from "@prisma/client";
import { db } from "../src/lib/db";
import { getNewsletterAdminData } from "../src/lib/newsletter-admin-data";
import { getPageContent } from "../src/lib/content/page-content";

const checks: { name: string; run: () => Promise<unknown> }[] = [
  { name: "membershipPlan.findMany", run: () => db.membershipPlan.findMany({ take: 1 }) },
  {
    name: "promoCode MEMBERSHIP scope",
    run: () =>
      db.promoCode.findMany({ where: { scope: PromoCodeScope.MEMBERSHIP }, take: 1 }),
  },
  {
    name: "promoCode LGB_EMAIL scope",
    run: () => db.promoCode.findMany({ where: { scope: PromoCodeScope.LGB_EMAIL }, take: 1 }),
  },
  { name: "newsletterBroadcast.findMany", run: () => db.newsletterBroadcast.findMany({ take: 1 }) },
  { name: "newsletter audience stats", run: () => getNewsletterAdminData() },
  { name: "faqEntry.findMany", run: () => db.faqEntry.findMany({ take: 1 }) },
  { name: "lead.findMany (newsletter index)", run: () => db.lead.findMany({ take: 1 }) },
  { name: "page content lgb-email", run: () => getPageContent("lgb-email") },
  { name: "page content home", run: () => getPageContent("home") },
  { name: "business.findMany", run: () => db.business.findMany({ take: 1 }) },
  { name: "category.findMany", run: () => db.category.findMany({ take: 1 }) },
];

async function main() {
  console.log("DB smoke checks...\n");
  let failed = 0;
  for (const check of checks) {
    try {
      await check.run();
      console.log(`  OK  ${check.name}`);
    } catch (error) {
      failed += 1;
      console.error(`  FAIL ${check.name}`);
      console.error(error);
    }
  }
  await db.$disconnect();
  if (failed > 0) {
    console.error(`\n${failed} check(s) failed.`);
    process.exit(1);
  }
  console.log(`\nAll ${checks.length} DB checks passed.`);
}

main();
