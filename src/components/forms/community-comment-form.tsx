"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitCommunityComment } from "@/lib/actions/leads";

export function CommunityCommentForm() {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await submitCommunityComment(formData);
      if (result.success) {
        toast.success("Comment submitted! It will appear after review.");
        (document.getElementById("community-comment-form") as HTMLFormElement | null)?.reset();
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form id="community-comment-form" action={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-white p-6">
      <h3 className="flex items-center gap-2 font-display text-xl font-bold text-navy">
        <MessageCircle className="size-5 text-buffalo-red" />
        Join the conversation
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="community-name">Your Name</Label>
          <Input id="community-name" name="name" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="community-email">Email</Label>
          <Input id="community-email" name="email" type="email" required className="mt-1" />
        </div>
      </div>
      <div>
        <Label htmlFor="community-message">Your comment</Label>
        <Textarea id="community-message" name="message" required rows={4} className="mt-1" placeholder="Share your thoughts about Buffalo businesses, events, or local tips..." />
      </div>
      <Button type="submit" variant="accent" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : "Post Comment"}
      </Button>
    </form>
  );
}
