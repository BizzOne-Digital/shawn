"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitGearInquiry } from "@/lib/actions/leads";

interface GearOrderFormProps {
  productName: string;
}

export function GearOrderForm({ productName }: GearOrderFormProps) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await submitGearInquiry(formData);
      if (result.success) {
        toast.success("Order inquiry sent! We'll email you to complete your purchase.");
        (document.getElementById(`gear-form-${productName}`) as HTMLFormElement | null)?.reset();
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form id={`gear-form-${productName}`} action={handleSubmit} className="mt-4 space-y-3 border-t border-border pt-4">
      <input type="hidden" name="product" value={productName} />
      <div>
        <Label htmlFor={`name-${productName}`}>Name</Label>
        <Input id={`name-${productName}`} name="name" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor={`email-${productName}`}>Email</Label>
        <Input id={`email-${productName}`} name="email" type="email" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor={`message-${productName}`}>Size / notes (optional)</Label>
        <Textarea id={`message-${productName}`} name="message" rows={2} className="mt-1" />
      </div>
      <Button type="submit" variant="accent" size="sm" disabled={pending} className="w-full">
        {pending ? <Loader2 className="animate-spin" /> : "Request to Order"}
      </Button>
    </form>
  );
}
