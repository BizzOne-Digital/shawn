import type { Db } from "mongodb";

/** Prisma @unique on optional MongoDB fields creates non-sparse indexes (only one null allowed). */
export async function ensureSparseUniqueIndexes(db: Db) {
  const specs: { collection: string; field: string }[] = [
    { collection: "User", field: "lgbEmail" },
    { collection: "User", field: "stripeCustomerId" },
    { collection: "Subscription", field: "businessId" },
    { collection: "Subscription", field: "stripeSubscriptionId" },
  ];

  for (const { collection, field } of specs) {
    const col = db.collection(collection);
    const indexName = `${collection}_${field}_key`;

    try {
      await col.dropIndex(indexName);
    } catch {
      // Index may not exist yet.
    }

    await col.createIndex({ [field]: 1 }, { unique: true, sparse: true, name: indexName });
  }
}
