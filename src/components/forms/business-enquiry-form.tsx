"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitBusinessEnquiry } from "@/lib/actions/leads";

interface BusinessEnquiryFormProps {
  businessId: string;
  businessName: string;
}

export function BusinessEnquiryForm({ businessId, businessName }: BusinessEnquiryFormProps) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await submitBusinessEnquiry(formData);
      if (result.success) {
        toast.success(`Your message was sent to ${businessName}!`);
      } else {
        toast.error(result.error ?? "Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="businessId" value={businessId} />
      <div className="space-y-2">
        <Label htmlFor="enquiry-name">Name</Label>
        <Input id="enquiry-name" name="name" required placeholder="Your name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="enquiry-email">Email</Label>
        <Input id="enquiry-email" name="email" type="email" required placeholder="you@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="enquiry-phone">Phone (optional)</Label>
        <Input id="enquiry-phone" name="phone" type="tel" placeholder="(716) 555-0123" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="enquiry-message">Message</Label>
        <Textarea
          id="enquiry-message"
          name="message"
          required
          rows={4}
          placeholder={`Ask ${businessName} a question…`}
        />
      </div>
      <Button type="submit" variant="accent" disabled={pending} className="w-full">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Send Enquiry"
        )}
      </Button>
    </form>
  );
}
