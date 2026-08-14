"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitNewsletterForm } from "@/lib/actions/leads";

interface NewsletterFormProps {
  className?: string;
  variant?: "default" | "inline";
}

export function NewsletterForm({ className, variant = "default" }: NewsletterFormProps) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await submitNewsletterForm(formData);
      if (result.success) {
        toast.success("You're subscribed! Welcome to the herd.");
      } else {
        toast.error(result.error ?? "Something went wrong. Please try again.");
      }
    });
  }

  if (variant === "inline") {
    return (
      <form action={handleSubmit} className={className}>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            name="email"
            type="email"
            required
            placeholder="Enter your email"
            className="bg-white"
          />
          <Button type="submit" variant="accent" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : "Subscribe"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form action={handleSubmit} className={className}>
      <Input
        name="email"
        type="email"
        required
        placeholder="Enter your email"
        className="mb-3"
      />
      <Button type="submit" variant="accent" disabled={pending} className="w-full">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Subscribing…
          </>
        ) : (
          "Subscribe to Updates"
        )}
      </Button>
    </form>
  );
}
