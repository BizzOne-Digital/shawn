"use server";

import { FanCommentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { fanCommentSchema } from "@/lib/validations/fan-page";

export async function submitFanComment(formData: FormData) {
  const parsed = fanCommentSchema.safeParse({
    postId: formData.get("postId"),
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid comment" };
  }

  const post = await db.fanPost.findFirst({
    where: { id: parsed.data.postId, isPublished: true },
    select: { id: true },
  });

  if (!post) {
    return { success: false, error: "This post is not available for comments." };
  }

  try {
    await db.fanComment.create({
      data: {
        postId: parsed.data.postId,
        name: parsed.data.name,
        email: parsed.data.email,
        message: parsed.data.message,
        status: FanCommentStatus.PENDING,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("submitFanComment failed:", error);
    return { success: false, error: "Unable to post comment right now." };
  }
}
