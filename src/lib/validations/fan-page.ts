import { z } from "zod";

export const fanCommentSchema = z.object({
  postId: z.string().min(1, "Post is required"),
  message: z.string().min(5, "Comment must be at least 5 characters").max(2000),
});

export const fanPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: z.string().min(1).max(120).optional(),
  excerpt: z.string().max(500).optional(),
  body: z.string().min(10, "Post body must be at least 10 characters"),
  authorName: z.string().min(1, "Author name is required"),
  coverImage: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export type FanCommentInput = z.infer<typeof fanCommentSchema>;
export type FanPostInput = z.infer<typeof fanPostSchema>;
