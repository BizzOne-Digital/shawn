"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Mail, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitLgbEmailRequest } from "@/lib/actions/leads";
import { LGB_EMAIL_DOMAIN } from "@/lib/validations/lgb-email";
import { CaptchaField } from "@/components/forms/captcha-field";

type AvailabilityState = "idle" | "checking" | "available" | "taken" | "error";

function AvailabilityHint({
  state,
  address,
}: {
  state: AvailabilityState;
  address?: string;
}) {
  if (state === "idle") return null;

  if (state === "checking") {
    return (
      <p className="mt-1 flex items-center gap-1 text-xs text-muted">
        <Loader2 className="size-3 animate-spin" />
        Checking availability...
      </p>
    );
  }

  if (state === "available") {
    return (
      <p className="mt-1 flex items-center gap-1 text-xs text-green-700">
        <CheckCircle2 className="size-3" />
        {address} is available
      </p>
    );
  }

  if (state === "taken") {
    return (
      <p className="mt-1 flex items-center gap-1 text-xs text-buffalo-red">
        <XCircle className="size-3" />
        {address} is already taken — try your backup choice below
      </p>
    );
  }

  return <p className="mt-1 text-xs text-buffalo-red">Could not check availability</p>;
}

export function LgbEmailRequestForm() {
  const [pending, startTransition] = useTransition();
  const [primaryLocalPart, setPrimaryLocalPart] = useState("");
  const [backupLocalPart, setBackupLocalPart] = useState("");
  const [primaryStatus, setPrimaryStatus] = useState<AvailabilityState>("idle");
  const [backupStatus, setBackupStatus] = useState<AvailabilityState>("idle");
  const [primaryAddress, setPrimaryAddress] = useState("");
  const [backupAddress, setBackupAddress] = useState("");

  const checkAvailability = useCallback(async (localPart: string, which: "primary" | "backup") => {
    const trimmed = localPart.trim();
    if (!trimmed) {
      if (which === "primary") {
        setPrimaryStatus("idle");
        setPrimaryAddress("");
      } else {
        setBackupStatus("idle");
        setBackupAddress("");
      }
      return;
    }

    if (which === "primary") setPrimaryStatus("checking");
    else setBackupStatus("checking");

    try {
      const res = await fetch(
        `/api/public/lgb-email/check?localPart=${encodeURIComponent(trimmed)}`
      );
      const data = await res.json();
      const nextStatus: AvailabilityState = data.available ? "available" : "taken";

      if (which === "primary") {
        setPrimaryStatus(nextStatus);
        setPrimaryAddress(data.address ?? "");
      } else {
        setBackupStatus(nextStatus);
        setBackupAddress(data.address ?? "");
      }
    } catch {
      if (which === "primary") setPrimaryStatus("error");
      else setBackupStatus("error");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void checkAvailability(primaryLocalPart, "primary");
    }, 400);
    return () => clearTimeout(timer);
  }, [primaryLocalPart, checkAvailability]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void checkAvailability(backupLocalPart, "backup");
    }, 400);
    return () => clearTimeout(timer);
  }, [backupLocalPart, checkAvailability]);

  function handleSubmit(formData: FormData) {
    if (
      primaryLocalPart.trim().toLowerCase() === backupLocalPart.trim().toLowerCase()
    ) {
      toast.error("Backup address must be different from your first choice");
      return;
    }

    if (primaryStatus === "taken" && backupStatus === "taken") {
      toast.error("Both email choices are taken. Please try different names.");
      return;
    }

    startTransition(async () => {
      const result = await submitLgbEmailRequest(formData);
      if (result.success) {
        toast.success("Email request sent! We'll contact you when your address is ready.");
        (document.getElementById("lgb-email-form") as HTMLFormElement | null)?.reset();
        setPrimaryLocalPart("");
        setBackupLocalPart("");
        setPrimaryStatus("idle");
        setBackupStatus("idle");
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
          <Label htmlFor="lgb-phone">Phone Number</Label>
          <Input
            id="lgb-phone"
            name="phone"
            type="tel"
            required
            className="mt-1"
            placeholder="(716) 555-0100"
          />
        </div>
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
        <Label htmlFor="requestedLocalPart">First choice — @LetsGoBuffalo.com address</Label>
        <div className="mt-1 flex rounded-lg border border-border bg-white focus-within:ring-2 focus-within:ring-navy/20">
          <Input
            id="requestedLocalPart"
            name="requestedLocalPart"
            required
            value={primaryLocalPart}
            onChange={(e) => setPrimaryLocalPart(e.target.value)}
            placeholder="Sally"
            className="border-0 shadow-none focus-visible:ring-0"
            autoComplete="off"
            spellCheck={false}
          />
          <span className="flex items-center whitespace-nowrap border-l border-border bg-soft-gray px-3 text-sm text-muted">
            @{LGB_EMAIL_DOMAIN}
          </span>
        </div>
        <AvailabilityHint state={primaryStatus} address={primaryAddress} />
        <p className="mt-1 text-xs text-muted">
          Examples: Sally, JoesPizza, BuffaloBakery — letters and numbers only
        </p>
      </div>

      <div>
        <Label htmlFor="backupLocalPart">Backup choice — if your first pick is taken</Label>
        <div className="mt-1 flex rounded-lg border border-border bg-white focus-within:ring-2 focus-within:ring-navy/20">
          <Input
            id="backupLocalPart"
            name="backupLocalPart"
            required
            value={backupLocalPart}
            onChange={(e) => setBackupLocalPart(e.target.value)}
            placeholder="SallySmith"
            className="border-0 shadow-none focus-visible:ring-0"
            autoComplete="off"
            spellCheck={false}
          />
          <span className="flex items-center whitespace-nowrap border-l border-border bg-soft-gray px-3 text-sm text-muted">
            @{LGB_EMAIL_DOMAIN}
          </span>
        </div>
        <AvailabilityHint state={backupStatus} address={backupAddress} />
        <p className="mt-1 text-xs text-muted">
          Required — choose a different name in case your first choice is unavailable.
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

      <CaptchaField />

      <Button type="submit" variant="accent" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? <Loader2 className="animate-spin" /> : "Send Request"}
        {!pending && <Mail className="size-4" />}
      </Button>
    </form>
  );
}
