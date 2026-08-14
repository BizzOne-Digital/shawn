import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using Let's Go Buffalo business directory.",
};

export default function TermsPage() {
  return (
    <div className="overflow-x-clip py-12 md:py-16">
      <div className="mx-auto max-w-3xl min-w-0 px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-navy">
          Terms &amp; Conditions
        </h1>
        <p className="text-sm text-muted mt-2">Last updated: August 14, 2026</p>

        <div className="prose prose-sm mt-10 max-w-none break-words space-y-8 text-muted">
          <section>
            <h2 className="font-display text-xl font-semibold text-navy">
              1. Acceptance of Terms
            </h2>
            <p className="mt-3 leading-relaxed">
              By accessing or using Let&apos;s Go Buffalo (&quot;the Service&quot;), operated
              in Buffalo, New York, you agree to be bound by these Terms and Conditions.
              If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-navy">
              2. Description of Service
            </h2>
            <p className="mt-3 leading-relaxed">
              Let&apos;s Go Buffalo provides an online business directory for Western New
              York, allowing users to discover local businesses and business owners to
              create and manage listings. Optional advertising services are available
              through a bidding system.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-navy">
              3. Business Listings
            </h2>
            <p className="mt-3 leading-relaxed">
              Business owners are responsible for the accuracy of their listing
              information, including hours, contact details, and descriptions. We
              reserve the right to review, edit, reject, suspend, or remove any listing
              that violates our guidelines or contains false, misleading, or offensive
              content.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-navy">
              4. Advertising &amp; Bidding
            </h2>
            <p className="mt-3 leading-relaxed">
              Sponsored placement is subject to campaign approval and available wallet
              balance. Daily bids are charged against your account balance when
              impressions are recorded. We do not guarantee specific placement,
              click-through rates, or business outcomes. All advertising fees are
              non-refundable except as required by law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-navy">
              5. User Conduct
            </h2>
            <p className="mt-3 leading-relaxed">
              You agree not to misuse the Service, submit spam or fraudulent listings,
              scrape data without permission, interfere with other users, or use the
              platform for unlawful purposes. We may terminate accounts that violate
              these terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-navy">
              6. Intellectual Property
            </h2>
            <p className="mt-3 leading-relaxed">
              The Let&apos;s Go Buffalo name, logo, and website design are our property.
              Business owners retain ownership of content they submit but grant us a
              license to display it on the platform for directory and promotional
              purposes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-navy">
              7. Disclaimer of Warranties
            </h2>
            <p className="mt-3 leading-relaxed">
              The Service is provided &quot;as is.&quot; We do not warrant the accuracy of
              business listings, endorse any business, or guarantee uninterrupted
              access. Your use of listed businesses is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-navy">
              8. Limitation of Liability
            </h2>
            <p className="mt-3 leading-relaxed">
              To the fullest extent permitted by New York law, Let&apos;s Go Buffalo shall
              not be liable for indirect, incidental, or consequential damages arising
              from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-navy">
              9. Governing Law
            </h2>
            <p className="mt-3 leading-relaxed">
              These terms are governed by the laws of the State of New York. Any disputes
              shall be resolved in Erie County, New York.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-navy">
              10. Contact
            </h2>
            <p className="mt-3 leading-relaxed">
              Questions about these terms? Contact us at{" "}
              <a href="mailto:admin@letsgobuffalo.com" className="text-buffalo-red hover:underline">
                admin@letsgobuffalo.com
              </a>{" "}
              or call (716) 559-5955.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
