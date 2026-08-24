import Link from "next/link";
import { db } from "@/lib/db";
import { FanCommentStatus } from "@prisma/client";
import { PageHeader } from "@/components/admin/page-header";
import { FanCommentActions } from "@/components/admin/fan-comment-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/admin-utils";
import { ArrowLeft } from "lucide-react";

export default async function FanCommentsPage() {
  const comments = await db.fanComment.findMany({
    where: { status: FanCommentStatus.PENDING },
    orderBy: { createdAt: "desc" },
    include: {
      post: { select: { id: true, title: true, slug: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Pending Fan Comments"
        description={`${comments.length} comment${comments.length === 1 ? "" : "s"} awaiting review`}
      >
        <Button variant="outline" asChild>
          <Link href="/admin/fan-page">
            <ArrowLeft className="size-4" />
            Back to Fan Page
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {comments.length === 0 ? (
            <p className="py-12 text-center text-muted">No pending comments. You&apos;re all caught up!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-navy">{comment.name}</p>
                    <p className="text-xs text-muted">{comment.email}</p>
                    <p className="mt-2 text-sm">
                      On post:{" "}
                      <Link
                        href={`/community/${comment.post.slug}`}
                        className="text-buffalo-red hover:underline"
                      >
                        {comment.post.title}
                      </Link>
                    </p>
                    <p className="mt-3 text-muted">{comment.message}</p>
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
  );
}
