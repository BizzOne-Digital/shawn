/**
 * Delete all businesses and related records. Keeps users, categories, and site config.
 */
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";

const DB_NAME = "letsgobuffalo";

function getUri() {
  const raw = process.env.DATABASE_URL ?? "mongodb://127.0.0.1:27017/letsgobuffalo";
  if (raw.includes("mongodb+srv://")) return raw;
  const base = raw.split("?")[0];
  return /\/[^/]+$/.test(base) ? base : `${base}/${DB_NAME}`;
}

async function deleteMany(
  db: import("mongodb").Db,
  collection: string,
  filter: Record<string, unknown> = {}
) {
  const result = await db.collection(collection).deleteMany(filter);
  if (result.deletedCount > 0) {
    console.log(`  - ${collection}: ${result.deletedCount} deleted`);
  }
  return result.deletedCount;
}

async function main() {
  console.log("🗑️  Deleting all businesses...\n");

  const client = new MongoClient(getUri());
  await client.connect();
  const db = client.db(DB_NAME);

  const businesses = await db.collection("Business").find().project({ _id: 1 }).toArray();
  const businessIds = businesses.map((b) => b._id as ObjectId);

  if (businessIds.length === 0) {
    console.log("No businesses found.");
    await client.close();
    return;
  }

  console.log(`Found ${businessIds.length} business(es). Removing related data...`);

  const campaigns = await db
    .collection("AdvertisingCampaign")
    .find({ businessId: { $in: businessIds } })
    .project({ _id: 1 })
    .toArray();
  const campaignIds = campaigns.map((c) => c._id as ObjectId);

  if (campaignIds.length > 0) {
    await deleteMany(db, "Bid", { campaignId: { $in: campaignIds } });
    await deleteMany(db, "CampaignTarget", { campaignId: { $in: campaignIds } });
    await deleteMany(db, "AdImpression", { campaignId: { $in: campaignIds } });
    await deleteMany(db, "AdClick", { campaignId: { $in: campaignIds } });
  }

  await deleteMany(db, "AdImpression", { businessId: { $in: businessIds } });
  await deleteMany(db, "AdClick", { businessId: { $in: businessIds } });
  await deleteMany(db, "AdvertisingCampaign", { businessId: { $in: businessIds } });
  await deleteMany(db, "Subscription", { businessId: { $in: businessIds } });
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
  await deleteMany(db, "Business", { _id: { $in: businessIds } });

  await client.close();
  console.log("\n✅ All businesses deleted.");
}

main().catch((error) => {
  console.error("❌ Delete failed:", error);
  process.exit(1);
});
