/**
 * Seeds starter fan page blog posts when the collection is empty.
 * Safe to run on existing databases: npx tsx scripts/seed-fan-posts.ts
 */
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";

const DB_NAME = "letsgobuffalo";

function getUri() {
  const raw = process.env.DATABASE_URL ?? "mongodb://127.0.0.1:27017/letsgobuffalo";
  const base = raw.split("?")[0];
  return base.includes("/") ? base : `${base}/${DB_NAME}`;
}

const fanPosts = [
  {
    title: "Welcome to the 716 Fan Page!",
    slug: "welcome-to-the-716-fan-page",
    excerpt: "Share local tips, shout out your favorite businesses, and connect with fellow Buffalonians.",
    body: "Welcome to the Let's Go Buffalo community fan page! This is your space to talk about local businesses, events, wing spots, and everything Western New York.\n\nRead the posts below and leave a comment on any article — we'd love to hear from you!",
    authorName: "Let's Go Buffalo Team",
  },
  {
    title: "Best wing spot this week?",
    slug: "best-wing-spot-this-week",
    excerpt: "Looking for recommendations — what local spot should I try next?",
    body: "I'm on a mission to try every great wing spot in Buffalo and WNY. Drop your favorites in the comments — bonus points if you tell us your go-to sauce!",
    authorName: "Mike from Allentown",
  },
  {
    title: "Supporting local this summer",
    slug: "supporting-local-this-summer",
    excerpt: "Love seeing so many WNY businesses on the directory. Keep listing, Buffalo!",
    body: "Summer is the perfect time to explore new local shops, restaurants, and services. If you've discovered a hidden gem on Let's Go Buffalo, tell us about it in the comments!",
    authorName: "Sarah W.",
  },
];

async function main() {
  const client = new MongoClient(getUri(), { directConnection: true });
  await client.connect();
  const db = client.db(DB_NAME);
  const now = new Date();

  const existing = await db.collection("FanPost").countDocuments();
  if (existing > 0) {
    console.log(`ℹ️  FanPost collection already has ${existing} post(s). Skipping.`);
    await client.close();
    return;
  }

  await db.collection("FanPost").insertMany(
    fanPosts.map((post, index) => ({
      _id: new ObjectId(),
      ...post,
      isPublished: true,
      publishedAt: new Date(now.getTime() - index * 86400000),
      createdAt: now,
      updatedAt: now,
    }))
  );

  console.log(`✅ Seeded ${fanPosts.length} fan page blog posts.`);
  await client.close();
}

main().catch((error) => {
  console.error("❌ seed-fan-posts failed:", error);
  process.exit(1);
});
