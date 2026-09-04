"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitFanComment } from "@/lib/actions/fan-page";

interface FanCommentFormProps {
  postId: string;
  postTitle: string;
  loginHref: string;
  user?: {
    name: string | null;
    email: string;
  } | null;
}

export function FanCommentForm({ postId, postTitle, loginHref, user }: FanCommentFormProps) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await submitFanComment(formData);
      if (result.success) {
        toast.success(
          "Comment submitted! An admin will review it before it appears on the site."
        );
        (document.getElementById(`fan-comment-form-${postId}`) as HTMLFormElement | null)?.reset();
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-soft-gray p-6 text-center">
        <MessageCircle className="mx-auto size-8 text-buffalo-red" />
        <h3 className="mt-3 font-display text-lg font-bold text-navy">Members only</h3>
        <p className="mt-2 text-sm text-muted">
          Sign in with your business or personal account to leave a comment. Comments are reviewed
          by admin before they are published.
        </p>
        <Button variant="accent" className="mt-4" asChild>
          <Link href={loginHref}>Sign in to comment</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      id={`fan-comment-form-${postId}`}
      action={handleSubmit}
      className="space-y-4 rounded-2xl border border-border bg-white p-6"
    >
      <input type="hidden" name="postId" value={postId} />
      <h3 className="flex items-center gap-2 font-display text-xl font-bold text-navy">
        <MessageCircle className="size-5 text-buffalo-red" />
        Comment on &ldquo;{postTitle}&rdquo;
      </h3>
      <p className="text-sm text-muted">
        Posting as <span className="font-medium text-navy">{user.name || user.email}</span>.
        Your comment will be sent to admin for approval before it appears publicly.
      </p>
      <div>
        <Label htmlFor={`fan-message-${postId}`}>Your comment</Label>
        <Textarea
          id={`fan-message-${postId}`}
          name="message"
          required
          rows={4}
          className="mt-1"
          placeholder="Share your thoughts about Buffalo businesses, events, or local tips..."
        />
      </div>
      <Button type="submit" variant="accent" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : "Submit Comment for Review"}
      </Button>
    </form>
  );
}
