/**
 * Initialize a single-node MongoDB replica set (required by Prisma for writes).
 *
 * MongoDB must be started with replication enabled. In mongod.cfg add:
 *   replication:
 *     replSetName: rs0
 * Then restart MongoDB and run: npm run db:init-replica
 */
import { MongoClient } from "mongodb";

const rawUrl = process.env.DATABASE_URL ?? "mongodb://127.0.0.1:27017/letsgobuffalo";
const baseUri = rawUrl.split("?")[0];
const uri = `${baseUri}?directConnection=true`;

function getReplicaHost(connectionUri: string) {
  const withoutQuery = connectionUri.split("?")[0] ?? connectionUri;
  const withoutProtocol = withoutQuery.replace(/^mongodb(\+srv)?:\/\//, "");
  const hostPart = withoutProtocol.split("/")[0] ?? "127.0.0.1:27017";
  return hostPart.split(",")[0] ?? "127.0.0.1:27017";
}

async function main() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  const host = getReplicaHost(uri);

  try {
    const status = await client.db("admin").command({ replSetGetStatus: 1 });
    console.log(`Replica set already active: ${status.set}`);
    return;
  } catch {
    // not initialized yet
  }

  try {
    await client.db("admin").command({
      replSetInitiate: {
        _id: "rs0",
        members: [{ _id: 0, host }],
      },
    });
    console.log("Replica set rs0 initialized. Wait a few seconds, then run npm run db:seed");
  } catch (error) {
    console.error("\nCould not initialize replica set.\n");
    console.error("Enable replication in MongoDB, then retry:\n");
    console.error("1. Open your MongoDB config (mongod.cfg)");
    console.error("2. Add:");
    console.error("   replication:");
    console.error("     replSetName: rs0");
    console.error("3. Restart MongoDB service");
    console.error("4. Run: npm run db:init-replica\n");
    throw error;
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  if (error instanceof Error && error.message) {
    console.error(error.message);
  }
  process.exit(1);
});
