"use server";

import { FanCommentStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { fanCommentSchema, fanPostSubmissionSchema } from "@/lib/validations/fan-page";

function slugifyTitle(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return `${base || "community-post"}-${Date.now()}`;
}

export async function submitFanPost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { success: false, error: "Please sign in to share a community post." };
  }

  if (
    session.user.role !== UserRole.BUSINESS_OWNER &&
    session.user.role !== UserRole.INDIVIDUAL
  ) {
    return {
      success: false,
      error: "Please sign in with your business or personal account.",
    };
  }

  const parsed = fanPostSubmissionSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid post" };
  }

  try {
    await db.fanPost.create({
      data: {
        title: parsed.data.title.trim(),
        slug: slugifyTitle(parsed.data.title),
        body: parsed.data.body.trim(),
        authorName: session.user.name?.trim() || session.user.email,
        isPublished: false,
      },
    });

    revalidatePath("/community");
    revalidatePath("/admin/fan-page");

    return { success: true };
  } catch (error) {
    console.error("submitFanPost failed:", error);
    return { success: false, error: "Unable to submit post right now." };
  }
}

export async function submitFanComment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { success: false, error: "Please sign in with your business account to comment." };
  }

  if (
    session.user.role !== UserRole.BUSINESS_OWNER &&
    session.user.role !== UserRole.INDIVIDUAL
  ) {
    return {
      success: false,
      error: "Please sign in with your business or personal account to comment.",
    };
  }

  const parsed = fanCommentSchema.safeParse({
    postId: formData.get("postId"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid comment" };
  }

  const post = await db.fanPost.findFirst({
    where: { id: parsed.data.postId, isPublished: true },
    select: { id: true, slug: true },
  });

  if (!post) {
    return { success: false, error: "This post is not available for comments." };
  }

  try {
    await db.fanComment.create({
      data: {
        postId: parsed.data.postId,
        userId: session.user.id,
        name: session.user.name?.trim() || session.user.email,
        email: session.user.email,
        message: parsed.data.message,
        status: FanCommentStatus.PENDING,
      },
    });

    revalidatePath("/admin/fan-page");
    revalidatePath("/admin/fan-page/comments");

    return { success: true };
  } catch (error) {
    console.error("submitFanComment failed:", error);
    return { success: false, error: "Unable to post comment right now." };
  }
}
