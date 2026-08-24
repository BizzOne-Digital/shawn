import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Users } from "lucide-react";
import { db } from "@/lib/db";
import { FanCommentStatus } from "@prisma/client";
import { FanPostCard } from "@/components/fan-page/fan-post-card";
import { getPageContent, txt } from "@/lib/content/page-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Community Fan Page & Blog",
  description:
    "Buffalo community fan page — read local blog posts and share your comments with Western New York.",
};

export default async function CommunityPage() {
  const content = await getPageContent("community");

  const posts = await db.fanPost.findMany({
    where: { isPublished: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: {
      _count: {
        select: {
          comments: { where: { status: FanCommentStatus.APPROVED } },
        },
      },
    },
  });

  return (
    <div className="overflow-x-clip">
      <section className="hero-gradient py-16 md:py-20">
        <div className="mx-auto max-w-4xl min-w-0 px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-white/10">
            <Users className="size-8 text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
            {txt(content, "hero.title")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            {txt(content, "hero.subtitle")}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl min-w-0 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-soft-gray p-10 text-center">
            <MessageCircle className="mx-auto size-10 text-muted" />
            <p className="mt-4 text-lg font-medium text-navy">No posts yet</p>
            <p className="mt-2 text-muted">Check back soon for Buffalo community updates and discussions.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <FanPostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-sm text-muted">
          {txt(content, "footer.text")}{" "}
          <Link href="/email-enrollment" className="text-buffalo-red hover:underline">
            Request one here
          </Link>
        </p>
      </div>
    </div>
  );
}
