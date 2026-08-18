"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitLgbEmailRequest } from "@/lib/actions/leads";

export function LgbEmailRequestForm() {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await submitLgbEmailRequest(formData);
      if (result.success) {
        toast.success("Email request submitted! We'll contact you when it's ready.");
        (document.getElementById("lgb-email-form") as HTMLFormElement | null)?.reset();
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form id="lgb-email-form" action={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="lgb-name">Your Name</Label>
          <Input id="lgb-name" name="name" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="lgb-contact-email">Your Current Email</Label>
          <Input id="lgb-contact-email" name="email" type="email" required className="mt-1" />
        </div>
      </div>
      <div>
        <Label htmlFor="requestedAddress">Desired @LetsGoBuffalo.com address</Label>
        <Input
          id="requestedAddress"
          name="requestedAddress"
          required
          placeholder="Sally@letsgobuffalo.com"
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted">Example: JoesPizza@letsgobuffalo.com</p>
      </div>
      <div>
        <Label htmlFor="forwardTo">Forward mail to this email</Label>
        <Input id="forwardTo" name="forwardTo" type="email" required placeholder="you@gmail.com" className="mt-1" />
      </div>
      <Button type="submit" variant="accent" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : "Request My Email"}
        {!pending && <Mail className="size-4" />}
      </Button>
    </form>
  );
}
