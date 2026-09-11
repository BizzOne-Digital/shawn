"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitFanPost } from "@/lib/actions/fan-page";

interface FanPostSubmitFormProps {
  loginHref: string;
  user?: {
    name: string | null;
    email: string;
  } | null;
}

export function FanPostSubmitForm({ loginHref, user }: FanPostSubmitFormProps) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await submitFanPost(formData);
      if (result.success) {
        toast.success("Post submitted! An admin will review it before it appears as its own listing on the fan page.");
        (document.getElementById("fan-post-form") as HTMLFormElement | null)?.reset();
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-soft-gray p-6 text-center">
        <PenSquare className="mx-auto size-8 text-buffalo-red" />
        <h3 className="mt-3 font-display text-lg font-bold text-navy">Share with the community</h3>
        <p className="mt-2 text-sm text-muted">
          Sign in to submit your own fan page post as a separate listing. Admin reviews before publishing.
        </p>
        <Button variant="accent" className="mt-4" asChild>
          <Link href={loginHref}>Sign in to post</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      id="fan-post-form"
      action={handleSubmit}
      className="space-y-4 rounded-2xl border border-border bg-white p-6"
    >
      <h3 className="flex items-center gap-2 font-display text-xl font-bold text-navy">
        <PenSquare className="size-5 text-buffalo-red" />
        Submit a community post
      </h3>
      <p className="text-sm text-muted">
        Posting as <span className="font-medium text-navy">{user.name || user.email}</span>.
        Your post will appear as its own block on the fan page after admin approval — not as a comment on our posts.
      </p>
      <div>
        <Label htmlFor="fan-post-title">Title</Label>
        <Input id="fan-post-title" name="title" required className="mt-1" placeholder="What's on your mind?" />
      </div>
      <div>
        <Label htmlFor="fan-post-body">Your post</Label>
        <Textarea
          id="fan-post-body"
          name="body"
          required
          rows={5}
          className="mt-1"
          placeholder="Share news, events, or local business highlights..."
        />
      </div>
      <Button type="submit" variant="accent" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : "Submit Post for Review"}
      </Button>
    </form>
  );
}
