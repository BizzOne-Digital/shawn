import type { Metadata } from "next";
import { LgbEmailEnrollmentContent } from "@/components/email/lgb-email-enrollment-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Email Enrollment — Get Your @LetsGoBuffalo.com Address",
  description:
    "Request a custom Let's Go Buffalo email like Sally@letsgobuffalo.com or JoesPizza@letsgobuffalo.com with forwarding to your inbox.",
};

export default function EmailEnrollmentPage() {
  return <LgbEmailEnrollmentContent />;
}
