import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { FanCommentStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { FanCommentForm } from "@/components/fan-page/fan-comment-form";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.fanPost.findFirst({
    where: { slug, isPublished: true },
    select: { title: true, excerpt: true, body: true },
  });

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.excerpt ?? post.body.slice(0, 160),
  };
}

export default async function CommunityPostPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const post = await db.fanPost.findFirst({
    where: { slug, isPublished: true },
    include: {
      comments: {
        where: { status: FanCommentStatus.APPROVED },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post) notFound();

  return (
    <div className="overflow-x-clip py-12 md:py-16">
      <div className="mx-auto max-w-3xl min-w-0 px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/community">
            <ArrowLeft className="size-4" />
            Back to Fan Page
          </Link>
        </Button>

        <article className="rounded-2xl border border-border bg-white p-6 md:p-8">
          <p className="text-xs uppercase tracking-wide text-buffalo-red">{post.authorName}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-navy md:text-4xl">{post.title}</h1>
          {post.publishedAt && (
            <time className="mt-3 block text-sm text-muted">
              {format(post.publishedAt, "MMMM d, yyyy")}
            </time>
          )}
          <div className="mt-6 whitespace-pre-wrap text-muted leading-relaxed">{post.body}</div>
        </article>

        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-bold text-navy">
            <MessageCircle className="size-6 text-buffalo-red" />
            Comments ({post.comments.length})
          </h2>

          {post.comments.length === 0 ? (
            <p className="mb-6 text-sm text-muted">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div className="mb-8 space-y-4">
              {post.comments.map((comment) => (
                <div key={comment.id} className="rounded-xl border border-border bg-white p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-navy">{comment.name}</p>
                    <time className="text-xs text-muted">
                      {format(comment.createdAt, "MMM d, yyyy")}
                    </time>
                  </div>
                  <p className="mt-3 text-muted leading-relaxed">{comment.message}</p>
                </div>
              ))}
            </div>
          )}

          <FanCommentForm
            postId={post.id}
            postTitle={post.title}
            loginHref={`/login?callbackUrl=${encodeURIComponent(`/community/${slug}`)}`}
            user={
              session?.user?.role === "BUSINESS_OWNER" && session.user.email
                ? { name: session.user.name ?? null, email: session.user.email }
                : null
            }
          />
        </section>
      </div>
    </div>
  );
}
