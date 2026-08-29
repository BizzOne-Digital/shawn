import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { FanPostForm } from "@/components/admin/fan-post-form";
import { FanCommentActions } from "@/components/admin/fan-comment-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/admin-utils";
import { ExternalLink } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditFanPostPage({ params }: Props) {
  const { id } = await params;
  const post = await db.fanPost.findUnique({
    where: { id },
    include: {
      comments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!post) notFound();

  return (
    <div className="space-y-8">
      <PageHeader title="Edit Fan Page Post" description={post.title}>
        {post.isPublished && (
          <Button variant="outline" asChild>
            <Link href={`/community/${post.slug}`} target="_blank">
              <ExternalLink className="size-4" />
              View on site
            </Link>
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-8 lg:grid-cols-2">
        <FanPostForm
          initialData={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            body: post.body,
            authorName: post.authorName,
            coverImage: post.coverImage,
            isPublished: post.isPublished,
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle>Comments ({post.comments.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {post.comments.length === 0 ? (
              <p className="text-sm text-muted">No comments on this post yet.</p>
            ) : (
              post.comments.map((comment) => (
                <div key={comment.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-navy">{comment.name}</p>
                      <p className="text-xs text-muted">{comment.email}</p>
                      <p className="mt-2 text-sm text-muted">{comment.message}</p>
                      <p className="mt-2 text-xs text-muted">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <FanCommentActions commentId={comment.id} status={comment.status} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
