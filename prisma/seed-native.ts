/**
 * MongoDB native seed — works without a replica set (Prisma seed requires rs0).
 * Seeds admin + site config only. Client adds categories, businesses, and users.
 */
import { MongoClient, ObjectId, type Db } from "mongodb";
import bcrypt from "bcryptjs";
import slugify from "slugify";
import "dotenv/config";
import { ensureSparseUniqueIndexes } from "../scripts/mongodb-sparse-indexes";

const PASSWORD = "Demo123!";
const DB_NAME = "letsgobuffalo";
const ADMIN_EMAIL = "admin@letsgobuffalo.com";

async function resetDatabase(db: Db) {
  const collections = await db.listCollections().toArray();
  for (const { name } of collections) {
    if (name.startsWith("system.")) continue;
    await db.collection(name).drop();
  }
}

function getUri() {
  const raw = process.env.DATABASE_URL ?? "mongodb://127.0.0.1:27017/letsgobuffalo";
  const base = raw.split("?")[0];
  return base.includes("/") ? base : `${base}/${DB_NAME}`;
}

function id() {
  return new ObjectId();
}

async function main() {
  console.log("🌱 Seeding Let's Go Buffalo (native MongoDB)...\n");

  const client = new MongoClient(getUri(), { directConnection: true });
  await client.connect();
  const db = client.db(DB_NAME);

  const adminExists = await db.collection("User").countDocuments({ email: ADMIN_EMAIL });
  if (adminExists > 0) {
    console.log("ℹ️  Database already seeded. Drop `letsgobuffalo` in Compass to re-seed.\n");
    await client.close();
    return;
  }

  const userCount = await db.collection("User").countDocuments();
  if (userCount > 0) {
    console.log("ℹ️  Partial seed detected — resetting database...\n");
    await resetDatabase(db);
  }

  await ensureSparseUniqueIndexes(db);

  const now = new Date();
  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const adminId = id();

  const plans = [
    { slug: "business-free-basic", name: "Free Basic Listing", memberType: "BUSINESS", businessTier: "FREE_BASIC", monthlyPrice: 0, yearlyPrice: 0, sortOrder: 1, maxImages: 0, maxDescriptionChars: 120, features: ["Company name", "Limited description", "Website link"] },
    { slug: "business-pro", name: "Pro Listing", memberType: "BUSINESS", businessTier: "PRO", monthlyPrice: 4.99, yearlyPrice: 49, sortOrder: 2, maxImages: 2, maxDescriptionChars: 5000, allowsVideo: true, allowsCoupon: true, allowsSocialLinks: true, allowsSearchKeywords: true, allowsLgbEmail: true, isPreLaunchPricing: true, features: ["Full description", "Coupon", "Images + video", "LGB email"] },
    { slug: "business-seller", name: "Seller Listing", memberType: "BUSINESS", businessTier: "SELLER", monthlyPrice: 3.99, yearlyPrice: 39, sortOrder: 3, maxImages: 10, maxDescriptionChars: 5000, allowsSellerProducts: true, maxSellerProducts: 10, isPreLaunchPricing: true, features: ["Up to 10 products", "Store links"] },
    { slug: "individual-free", name: "Individual (Free)", memberType: "INDIVIDUAL", individualTier: "FREE", monthlyPrice: 0, yearlyPrice: 0, sortOrder: 4, features: ["Community blog", "Local deals"] },
    { slug: "individual-pro", name: "Individual Pro", memberType: "INDIVIDUAL", individualTier: "PRO", monthlyPrice: 0.99, yearlyPrice: 9.99, sortOrder: 5, allowsLgbEmail: true, isPreLaunchPricing: true, features: ["LGB email forwarding", "Extra discounts"] },
  ].map((p) => ({
    _id: id(),
    ...p,
    description: p.name,
    isActive: true,
    allowsVideo: p.allowsVideo ?? false,
    allowsCoupon: p.allowsCoupon ?? false,
    allowsSocialLinks: p.allowsSocialLinks ?? false,
    allowsSearchKeywords: p.allowsSearchKeywords ?? false,
    allowsLgbEmail: p.allowsLgbEmail ?? false,
    allowsSellerProducts: p.allowsSellerProducts ?? false,
    maxSellerProducts: p.maxSellerProducts ?? 0,
    stripeMonthlyPriceId: null,
    stripeYearlyPriceId: null,
    createdAt: now,
    updatedAt: now,
  }));

  await db.collection("MembershipPlan").insertMany(plans);

  await db.collection("PromoCode").insertOne({
    _id: id(),
    code: "LAUNCH20",
    description: "20% off first year",
    type: "PERCENTAGE",
    value: 20,
    applicablePlanIds: [],
    maxRedemptions: 100,
    redemptionCount: 0,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  await db.collection("User").insertOne({
    _id: adminId,
    email: ADMIN_EMAIL,
    name: "Admin User",
    passwordHash,
    role: "ADMIN",
    memberType: "BUSINESS",
    individualTier: "FREE",
    isActive: true,
    emailVerified: now,
    createdAt: now,
    updatedAt: now,
  });

  await db.collection("SiteSetting").insertMany([
    { _id: id(), key: "ad_max_positions", value: 3, updatedAt: now },
    { _id: id(), key: "ad_minimum_daily_bid", value: 0.25, updatedAt: now },
    { _id: id(), key: "ad_tie_break_earliest", value: true, updatedAt: now },
    { _id: id(), key: "ad_approval_required", value: true, updatedAt: now },
    { _id: id(), key: "contact_email", value: ADMIN_EMAIL, updatedAt: now },
    { _id: id(), key: "contact_phone", value: "716-559-5955", updatedAt: now },
    { _id: id(), key: "require_re_review", value: true, updatedAt: now },
    { _id: id(), key: "homepage_stats", value: { businesses: 0, categories: 0, searches: 0, leads: 0 }, updatedAt: now },
  ]);

  const locationData = [
    { city: "Buffalo", zipCode: "14201" },
    { city: "Amherst", zipCode: "14226" },
    { city: "Cheektowaga", zipCode: "14225" },
    { city: "Tonawanda", zipCode: "14150" },
    { city: "Williamsville", zipCode: "14221" },
    { city: "Hamburg", zipCode: "14075" },
    { city: "Orchard Park", zipCode: "14127" },
    { city: "Niagara Falls", zipCode: "14301" },
  ];
  await db.collection("Location").insertMany(
    locationData.map((loc) => ({
      _id: id(),
      ...loc,
      slug: slugify(loc.city, { lower: true }),
      state: "NY",
      region: "Western New York",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }))
  );

  await db.collection("AuditLog").insertOne({
    _id: id(),
    userId: adminId,
    action: "SEED",
    entity: "Database",
    metadata: { version: "native-2.0", note: "Admin + config only" },
    createdAt: now,
  });

  await client.close();

  console.log("✅ Seed completed successfully!\n");
  console.log("📋 Admin login:");
  console.log(`   ${ADMIN_EMAIL} / ${PASSWORD}\n`);
  console.log("ℹ️  Categories, businesses, and users are empty — client will add these.\n");
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
