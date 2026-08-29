import Link from "next/link";
import { format } from "date-fns";
import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CmsImage } from "@/components/ui/cms-image";

interface FanPostCardProps {
  post: {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    body: string;
    authorName: string;
    coverImage?: string | null;
    publishedAt: Date | null;
    _count?: { comments: number };
    commentCount?: number;
  };
}

export function FanPostCard({ post }: FanPostCardProps) {
  const preview = post.excerpt || post.body;
  const commentCount = post._count?.comments ?? post.commentCount ?? 0;

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-white transition-shadow hover:shadow-md">
      {post.coverImage ? (
        <div className="relative h-44 w-full bg-soft-gray">
          <CmsImage
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      ) : null}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-buffalo-red">{post.authorName}</p>
            <h2 className="mt-2 font-display text-xl font-semibold text-navy">
              <Link href={`/community/${post.slug}`} className="hover:text-buffalo-red">
                {post.title}
              </Link>
            </h2>
          </div>
          {post.publishedAt && (
            <time className="shrink-0 text-xs text-muted">
              {format(post.publishedAt, "MMM d, yyyy")}
            </time>
          )}
        </div>
        <p className="mt-3 line-clamp-3 text-muted leading-relaxed">{preview}</p>
        <div className="mt-5 flex items-center justify-between gap-4">
          <Badge variant="secondary" className="gap-1">
            <MessageCircle className="size-3.5" />
            {commentCount} comment{commentCount === 1 ? "" : "s"}
          </Badge>
          <Link
            href={`/community/${post.slug}`}
            className="text-sm font-medium text-buffalo-red hover:underline"
          >
            Read &amp; comment →
          </Link>
        </div>
      </div>
    </article>
  );
}
