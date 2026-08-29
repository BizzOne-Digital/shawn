"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitLgbEmailRequest } from "@/lib/actions/leads";
import { LGB_EMAIL_DOMAIN } from "@/lib/validations/lgb-email";

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
    <form
      id="lgb-email-form"
      action={handleSubmit}
      className="space-y-5 rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="lgb-name">Your Name</Label>
          <Input id="lgb-name" name="name" required className="mt-1" placeholder="Sally Smith" />
        </div>
        <div>
          <Label htmlFor="lgb-business-name">Business Name (optional)</Label>
          <Input
            id="lgb-business-name"
            name="businessName"
            className="mt-1"
            placeholder="Joe's Pizza"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="lgb-contact-email">Your Current Email</Label>
        <Input
          id="lgb-contact-email"
          name="email"
          type="email"
          required
          className="mt-1"
          placeholder="you@gmail.com"
        />
        <p className="mt-1 text-xs text-muted">We&apos;ll use this to confirm your request.</p>
      </div>

      <div>
        <Label htmlFor="requestedLocalPart">Choose your @LetsGoBuffalo.com address</Label>
        <div className="mt-1 flex rounded-lg border border-border bg-white focus-within:ring-2 focus-within:ring-navy/20">
          <Input
            id="requestedLocalPart"
            name="requestedLocalPart"
            required
            placeholder="Sally"
            className="border-0 shadow-none focus-visible:ring-0"
            autoComplete="off"
            spellCheck={false}
          />
          <span className="flex items-center whitespace-nowrap border-l border-border bg-soft-gray px-3 text-sm text-muted">
            @{LGB_EMAIL_DOMAIN}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted">
          Examples: Sally, JoesPizza, BuffaloBakery — letters and numbers only
        </p>
      </div>

      <div>
        <Label htmlFor="forwardTo">Forward mail to this email</Label>
        <Input
          id="forwardTo"
          name="forwardTo"
          type="email"
          required
          placeholder="you@gmail.com"
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted">
          Messages sent to your @LetsGoBuffalo.com address will forward here.
        </p>
      </div>

      <Button type="submit" variant="accent" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? <Loader2 className="animate-spin" /> : "Request My Email"}
        {!pending && <Mail className="size-4" />}
      </Button>
    </form>
  );
}
