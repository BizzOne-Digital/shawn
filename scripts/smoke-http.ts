/**
 * HTTP smoke test against a running Next server (default http://localhost:3000).
 */
import { db } from "../src/lib/db";

const base = (process.env.SMOKE_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const publicPages = [
  "/",
  "/about",
  "/advertise",
  "/community",
  "/contact",
  "/directory",
  "/email-enrollment",
  "/lgb-email",
  "/fan-page",
  "/faq",
  "/gear",
  "/pricing",
  "/privacy",
  "/terms",
  "/login",
  "/register",
  "/forgot-password",
  "/search",
  "/admin-login",
  "/robots.txt",
  "/sitemap.xml",
];

const publicApis = [
  "/api/public/plans",
  "/api/public/categories",
  "/api/public/locations",
  "/api/public/captcha",
  "/api/public/ad-settings",
  "/api/public/lgb-email/check?localPart=SmokeTest12345",
  "/api/public/lgb-email/promo?code=INVALID_SMOKE_CODE",
];

/** Redirect or auth expected — must not be 500 */
const protectedPaths = [
  "/admin",
  "/admin/leads",
  "/admin/plans",
  "/admin/email-discounts",
  "/admin/newsletters",
  "/admin/faq",
  "/dashboard",
  "/dashboard/billing",
  "/api/admin/newsletters",
  "/api/admin/promo-codes?scope=LGB_EMAIL",
];

function okStatus(status: number, allowRedirect: boolean): boolean {
  if (status >= 500) return false;
  if (allowRedirect) return status < 500;
  return status >= 200 && status < 400;
}

async function fetchPath(path: string, allowRedirect: boolean) {
  const url = `${base}${path}`;
  const res = await fetch(url, { redirect: allowRedirect ? "manual" : "follow" });
  return { path, status: res.status, ok: okStatus(res.status, allowRedirect) };
}

async function main() {
  console.log(`HTTP smoke against ${base}\n`);

  const dynamicPages: string[] = [];
  try {
    const [fanPost, category, business] = await Promise.all([
      db.fanPost.findFirst({ where: { isPublished: true }, select: { slug: true } }),
      db.category.findFirst({ select: { slug: true } }),
      db.business.findFirst({ where: { status: "APPROVED" }, select: { slug: true } }),
    ]);
    if (fanPost?.slug) dynamicPages.push(`/community/${fanPost.slug}`);
    if (category?.slug) dynamicPages.push(`/categories/${category.slug}`);
    if (business?.slug) dynamicPages.push(`/business/${business.slug}`);
  } catch (error) {
    console.warn("Could not load dynamic slugs for smoke:", error);
  } finally {
    await db.$disconnect();
  }

  const allPages = [...publicPages, ...dynamicPages];

  try {
    const probe = await fetch(`${base}/`, { signal: AbortSignal.timeout(5000) });
    if (!probe.ok && probe.status >= 500) {
      console.error("Server not healthy on /. Start with: npm run start");
      process.exit(1);
    }
  } catch {
    console.error(`Cannot reach ${base}. Run: npm run build && npm run start`);
    process.exit(1);
  }

  let failed = 0;

  for (const path of allPages) {
    const { status, ok } = await fetchPath(path, false);
    if (!ok) {
      failed += 1;
      console.error(`  FAIL ${path} → ${status}`);
    } else {
      console.log(`  OK  ${path} → ${status}`);
    }
  }

  for (const path of publicApis) {
    const { status, ok } = await fetchPath(path, false);
    if (!ok) {
      failed += 1;
      console.error(`  FAIL ${path} → ${status}`);
    } else {
      console.log(`  OK  ${path} → ${status}`);
    }
  }

  for (const path of protectedPaths) {
    const { status, ok } = await fetchPath(path, true);
    if (!ok) {
      failed += 1;
      console.error(`  FAIL ${path} → ${status} (expected redirect/auth, not 5xx)`);
    } else {
      console.log(`  OK  ${path} → ${status}`);
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} HTTP check(s) failed.`);
    process.exit(1);
  }
  console.log(
    `\nAll ${allPages.length + publicApis.length + protectedPaths.length} HTTP checks passed.`
  );
}

main();
