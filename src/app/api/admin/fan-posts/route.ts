import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi, recordAuditLog, slugify } from "@/lib/admin-utils";
import { fanPostSchema } from "@/lib/validations/fan-page";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  const posts = await db.fanPost.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const body = await request.json();
  const parsed = fanPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.title);
  const existing = await db.fanPost.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const isPublished = parsed.data.isPublished ?? false;

  const post = await db.fanPost.create({
    data: {
      title: parsed.data.title,
      slug,
      excerpt: parsed.data.excerpt,
      body: parsed.data.body,
      authorName: parsed.data.authorName,
      coverImage: parsed.data.coverImage || null,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    },
  });

  await recordAuditLog({
    userId: user!.id,
    action: "CREATE_FAN_POST",
    entity: "FanPost",
    entityId: post.id,
    metadata: { title: post.title },
  });

  return NextResponse.json(post, { status: 201 });
}
