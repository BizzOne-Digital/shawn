import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi, recordAuditLog, slugify } from "@/lib/admin-utils";
import { fanPostSchema } from "@/lib/validations/fan-page";

const updateSchema = fanPostSchema.partial();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  const post = await db.fanPost.findUnique({
    where: { id },
    include: {
      comments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  const existing = await db.fanPost.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const slug = parsed.data.slug?.trim() || (parsed.data.title ? slugify(parsed.data.title) : existing.slug);
  if (slug !== existing.slug) {
    const slugTaken = await db.fanPost.findUnique({ where: { slug } });
    if (slugTaken) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
  }

  const isPublished = parsed.data.isPublished ?? existing.isPublished;
  const publishedAt =
    isPublished && !existing.isPublished
      ? new Date()
      : isPublished
        ? existing.publishedAt
        : null;

  const post = await db.fanPost.update({
    where: { id },
    data: {
      ...(parsed.data.title !== undefined && { title: parsed.data.title }),
      slug,
      ...(parsed.data.excerpt !== undefined && { excerpt: parsed.data.excerpt }),
      ...(parsed.data.body !== undefined && { body: parsed.data.body }),
      ...(parsed.data.authorName !== undefined && { authorName: parsed.data.authorName }),
      isPublished,
      publishedAt,
    },
  });

  await recordAuditLog({
    userId: user!.id,
    action: "UPDATE_FAN_POST",
    entity: "FanPost",
    entityId: post.id,
    metadata: { title: post.title },
  });

  return NextResponse.json(post);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdminApi();
  if (error) return error;

  const { id } = await params;
  const existing = await db.fanPost.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await db.fanPost.delete({ where: { id } });

  await recordAuditLog({
    userId: user!.id,
    action: "DELETE_FAN_POST",
    entity: "FanPost",
    entityId: id,
    metadata: { title: existing.title },
  });

  return NextResponse.json({ success: true });
}
