import type { Metadata } from "next";
import { CommunityCommentForm } from "@/components/forms/community-comment-form";
import { communityPosts } from "@/lib/content/community-posts";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Community Fan Page",
  description: "Buffalo community blog and fan page — share comments and connect with Western New York.",
};

export default function CommunityPage() {
  return (
    <div className="overflow-x-clip py-12 md:py-16">
      <div className="mx-auto max-w-3xl min-w-0 px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-navy">Community Fan Page</h1>
        <p className="mt-4 text-lg text-muted">
          Talk Buffalo businesses, local events, and WNY life. Comments are reviewed before appearing publicly.
        </p>

        <div className="mt-10 space-y-6">
          {communityPosts.map((post) => (
            <article key={post.id} className="rounded-2xl border border-border bg-white p-6">
              <p className="text-xs uppercase tracking-wide text-buffalo-red">{post.author}</p>
              <h2 className="mt-2 font-display text-xl font-semibold text-navy">{post.title}</h2>
              <p className="mt-3 text-muted leading-relaxed">{post.body}</p>
              <p className="mt-4 text-xs text-muted">{post.date}</p>
            </article>
          ))}
        </div>

        <div className="mt-10">
          <CommunityCommentForm />
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          Want a custom @LetsGoBuffalo.com email?{" "}
          <Link href="/lgb-email" className="text-buffalo-red hover:underline">
            Request one here
          </Link>
        </p>
      </div>
    </div>
  );
}
