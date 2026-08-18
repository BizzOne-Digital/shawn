import type { Metadata } from "next";
import Link from "next/link";
import { LgbEmailRequestForm } from "@/components/forms/lgb-email-request-form";

export const metadata: Metadata = {
  title: "Get Your @LetsGoBuffalo.com Email",
  description: "Request a custom Let's Go Buffalo email address with forwarding.",
};

export default function LgbEmailPage() {
  return (
    <div className="overflow-x-clip py-12 md:py-16">
      <div className="mx-auto max-w-2xl min-w-0 px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-navy">Your @LetsGoBuffalo.com Email</h1>
        <p className="mt-4 text-lg text-muted">
          Get a professional local email like <strong>Sally@letsgobuffalo.com</strong> or{" "}
          <strong>JoesPizza@letsgobuffalo.com</strong>. Mail forwards to your existing inbox.
        </p>

        <ul className="mt-6 space-y-2 text-sm text-muted">
          <li>• Available with Pro business or individual membership</li>
          <li>• Choose your preferred address (subject to availability)</li>
          <li>• We set up forwarding to Gmail, Outlook, or any email you use today</li>
        </ul>

        <div className="mt-10">
          <LgbEmailRequestForm />
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/pricing" className="text-buffalo-red hover:underline">
            View membership plans
          </Link>
        </p>
      </div>
    </div>
  );
}
