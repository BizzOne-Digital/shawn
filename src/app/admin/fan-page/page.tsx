import Link from "next/link";
import { db } from "@/lib/db";
import { FanCommentStatus } from "@prisma/client";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/admin-utils";
import { Plus, MessageSquare } from "lucide-react";

export default async function AdminFanPage() {
  const [posts, pendingComments] = await Promise.all([
    db.fanPost.findMany({
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: {
            comments: {
              where: { status: FanCommentStatus.APPROVED },
            },
          },
        },
      },
    }),
    db.fanComment.count({ where: { status: FanCommentStatus.PENDING } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Community Fan Page"
        description="Manage blog posts and moderate fan comments"
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/fan-page/comments">
              <MessageSquare className="size-4" />
              Pending Comments
              {pendingComments > 0 && (
                <Badge className="ml-2 bg-buffalo-red">{pendingComments}</Badge>
              )}
            </Link>
          </Button>
          <Button variant="accent" asChild>
            <Link href="/admin/fan-page/new">
              <Plus className="size-4" />
              New Post
            </Link>
          </Button>
        </div>
      </PageHeader>

      <Card className="mb-6 border-dashed">
        <CardContent className="py-4 text-sm text-muted">
          Published posts appear on the public fan page at{" "}
          <Link href="/community" className="text-buffalo-red hover:underline">
            /community
          </Link>
          . Comments are held for review until you approve them.
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {posts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-medium text-navy">No fan page posts yet</p>
              <p className="mt-2 max-w-md mx-auto text-muted">
                Create your first blog post for the Buffalo community fan page.
              </p>
              <Button variant="accent" className="mt-6" asChild>
                <Link href="/admin/fan-page/new">Create First Post</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="font-medium text-navy">{post.title}</div>
                      <div className="text-xs text-muted">/community/{post.slug}</div>
                    </TableCell>
                    <TableCell>{post.authorName}</TableCell>
                    <TableCell>{post._count.comments}</TableCell>
                    <TableCell>
                      <Badge variant={post.isPublished ? "default" : "secondary"}>
                        {post.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted">
                      {formatDate(post.publishedAt ?? post.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/fan-page/${post.id}`}>Edit</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
