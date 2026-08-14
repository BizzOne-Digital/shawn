import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Let's Go Buffalo business directory.",
};

export default function PrivacyPage() {
  return (
    <div className="overflow-x-clip py-12 md:py-16">
      <div className="mx-auto max-w-3xl min-w-0 px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-navy">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted mt-2">Last updated: August 14, 2026</p>

        <div className="prose prose-sm mt-10 max-w-none break-words space-y-8 text-muted">
          <section>
            <h2 className="font-display text-xl font-semibold text-navy">
              1. Information We Collect
            </h2>
            <p className="mt-3 leading-relaxed">
              We collect information you provide directly — such as name, email, phone
              number, and business details when you register, submit a listing, contact
              us, or subscribe to our newsletter. We also collect usage data including
              search queries, page views, and advertising interactions.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-navy">
              2. How We Use Information
            </h2>
            <p className="mt-3 leading-relaxed">
              We use your information to operate and improve the directory, process
              business listings, deliver advertising services, respond to enquiries,
              send newsletters (with your consent), and analyze platform usage to
              better serve the Buffalo business community.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-navy">
              3. Business Listing Information
            </h2>
            <p className="mt-3 leading-relaxed">
              Information you include in a published business listing (name, address,
              phone, hours, description, images) is displayed publicly on the platform
              and may appear in search engine results. Do not include private
              information you do not wish to be public.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-navy">
              4. Cookies &amp; Analytics
            </h2>
            <p className="mt-3 leading-relaxed">
              We use cookies and similar technologies to maintain sessions, remember
              preferences, and understand how visitors use our site. You can control
              cookies through your browser settings, though some features may not
              function properly without them.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-navy">
              5. Third-Party Services
            </h2>
            <p className="mt-3 leading-relaxed">
              We use third-party services for authentication, payment processing
              (Stripe), email delivery, and image hosting. These providers have their
              own privacy policies governing how they handle your data.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-navy">
              6. Data Sharing
            </h2>
            <p className="mt-3 leading-relaxed">
              We do not sell your personal information. We may share data with service
              providers who assist in operating the platform, when required by law, or
              to protect the rights and safety of our users and the public.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-navy">
              7. Data Retention &amp; Security
            </h2>
            <p className="mt-3 leading-relaxed">
              We retain your data for as long as your account is active or as needed to
              provide services. We implement reasonable security measures to protect
              your information, but no method of transmission over the internet is
              100% secure.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-navy">
              8. Your Rights
            </h2>
            <p className="mt-3 leading-relaxed">
              New York residents may request access to, correction of, or deletion of
              personal data we hold about you. Contact us to exercise these rights. You
              may unsubscribe from marketing emails at any time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-navy">
              9. Children&apos;s Privacy
            </h2>
            <p className="mt-3 leading-relaxed">
              The Service is not directed to children under 13. We do not knowingly
              collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-navy">
              10. Contact Us
            </h2>
            <p className="mt-3 leading-relaxed">
              For privacy-related questions, contact us at{" "}
              <a href="mailto:admin@letsgobuffalo.com" className="text-buffalo-red hover:underline">
                admin@letsgobuffalo.com
              </a>{" "}
              or (716) 559-5955.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
