/**
 * Remove demo categories, businesses, and non-admin users.
 * Keeps admin account + site config (plans, settings, locations).
 */
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";

const DB_NAME = "letsgobuffalo";

function getUri() {
  const raw = process.env.DATABASE_URL ?? "mongodb://127.0.0.1:27017/letsgobuffalo";
  if (raw.includes("directConnection=")) return raw;
  const base = raw.split("?")[0];
  return `${base}?directConnection=true`;
}

async function deleteMany(db: import("mongodb").Db, collection: string, filter: Record<string, unknown> = {}) {
  const result = await db.collection(collection).deleteMany(filter);
  if (result.deletedCount > 0) {
    console.log(`  - ${collection}: ${result.deletedCount} deleted`);
  }
  return result.deletedCount;
}

async function main() {
  console.log("🧹 Cleaning demo data...\n");

  const client = new MongoClient(getUri(), { directConnection: true });
  await client.connect();
  const db = client.db(DB_NAME);

  const admin = await db.collection("User").findOne({ role: "ADMIN" });
  const adminId = admin?._id as ObjectId | undefined;

  const nonAdminFilter = adminId ? { _id: { $ne: adminId } } : { role: { $ne: "ADMIN" } };
  const nonAdminUsers = await db.collection("User").find(nonAdminFilter).project({ _id: 1 }).toArray();
  const nonAdminIds = nonAdminUsers.map((u) => u._id as ObjectId);

  const businesses = await db.collection("Business").find().project({ _id: 1 }).toArray();
  const businessIds = businesses.map((b) => b._id as ObjectId);

  const campaigns = await db.collection("AdvertisingCampaign").find().project({ _id: 1 }).toArray();
  const campaignIds = campaigns.map((c) => c._id as ObjectId);

  console.log("Removing business-related data...");
  if (businessIds.length > 0) {
    await deleteMany(db, "BusinessHour", { businessId: { $in: businessIds } });
    await deleteMany(db, "BusinessImage", { businessId: { $in: businessIds } });
    await deleteMany(db, "SocialLink", { businessId: { $in: businessIds } });
    await deleteMany(db, "ListingSubmission", { businessId: { $in: businessIds } });
    await deleteMany(db, "ModerationAction", { businessId: { $in: businessIds } });
    await deleteMany(db, "Lead", { businessId: { $in: businessIds } });
    await deleteMany(db, "SavedBusiness", { businessId: { $in: businessIds } });
    await deleteMany(db, "BusinessView", { businessId: { $in: businessIds } });
    await deleteMany(db, "SellerProduct", { businessId: { $in: businessIds } });
    await deleteMany(db, "Report", { businessId: { $in: businessIds } });
  }

  if (campaignIds.length > 0) {
    await deleteMany(db, "Bid", { campaignId: { $in: campaignIds } });
    await deleteMany(db, "CampaignTarget", { campaignId: { $in: campaignIds } });
    await deleteMany(db, "AdImpression", { campaignId: { $in: campaignIds } });
    await deleteMany(db, "AdClick", { campaignId: { $in: campaignIds } });
    await deleteMany(db, "Transaction", { campaignId: { $in: campaignIds } });
  }

  await deleteMany(db, "AdvertisingCampaign");
  await deleteMany(db, "Business");

  console.log("Removing categories...");
  await deleteMany(db, "Subcategory");
  await deleteMany(db, "Category");

  console.log("Removing non-admin users...");
  if (nonAdminIds.length > 0) {
    await deleteMany(db, "Account", { userId: { $in: nonAdminIds } });
    await deleteMany(db, "Session", { userId: { $in: nonAdminIds } });
    await deleteMany(db, "Wallet", { userId: { $in: nonAdminIds } });
    await deleteMany(db, "Transaction", { userId: { $in: nonAdminIds } });
    await deleteMany(db, "Subscription", { userId: { $in: nonAdminIds } });
    await deleteMany(db, "PromoCodeRedemption", { userId: { $in: nonAdminIds } });
    await deleteMany(db, "Notification", { userId: { $in: nonAdminIds } });
    await deleteMany(db, "SearchQuery", { userId: { $in: nonAdminIds } });
    await deleteMany(db, "SavedBusiness", { userId: { $in: nonAdminIds } });
    await deleteMany(db, "Report", { reporterId: { $in: nonAdminIds } });
    await deleteMany(db, "AuditLog", { userId: { $in: nonAdminIds } });
    await deleteMany(db, "User", { _id: { $in: nonAdminIds } });
  }

  await db.collection("SiteSetting").updateOne(
    { key: "homepage_stats" },
    {
      $set: {
        value: { businesses: 0, categories: 0, searches: 0, leads: 0 },
        updatedAt: new Date(),
      },
    }
  );
  console.log("  - SiteSetting homepage_stats reset to 0");

  await client.close();

  console.log("\n✅ Cleanup complete.");
  if (admin) {
    console.log(`   Admin kept: ${admin.email}`);
  } else {
    console.log("   No admin user found. Run npm run db:seed to create one.");
  }
  console.log("");
}

main().catch((error) => {
  console.error("❌ Cleanup failed:", error);
  process.exit(1);
});
