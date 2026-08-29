"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitFanComment } from "@/lib/actions/fan-page";

interface FanCommentFormProps {
  postId: string;
  postTitle: string;
}

export function FanCommentForm({ postId, postTitle }: FanCommentFormProps) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await submitFanComment(formData);
      if (result.success) {
        toast.success("Comment submitted! It will appear after review.");
        (document.getElementById(`fan-comment-form-${postId}`) as HTMLFormElement | null)?.reset();
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`fan-name-${postId}`}>Your Name</Label>
          <Input id={`fan-name-${postId}`} name="name" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor={`fan-email-${postId}`}>Email</Label>
          <Input id={`fan-email-${postId}`} name="email" type="email" required className="mt-1" />
        </div>
      </div>
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
        {pending ? <Loader2 className="animate-spin" /> : "Post Comment"}
      </Button>
    </form>
  );
}
