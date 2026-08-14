import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Let's Go Buffalo team. Email admin@letsgobuffalo.com or call (716) 559-5955.",
};

export default function ContactPage() {
  return (
    <div className="overflow-x-clip py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-navy">
          Contact Us
        </h1>
        <p className="mt-4 text-lg text-muted max-w-2xl">
          Have a question about listing your business, advertising, or using the
          directory? Our Buffalo-based team is here to help.
        </p>

        <div className="grid lg:grid-cols-2 gap-10 mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Send a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="size-5 text-buffalo-red flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy">Email</h3>
                    <a
                      href="mailto:admin@letsgobuffalo.com"
                      className="text-muted hover:text-buffalo-red transition-colors"
                    >
                      admin@letsgobuffalo.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="size-5 text-buffalo-red flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy">Phone</h3>
                    <a
                      href="tel:7165595955"
                      className="text-muted hover:text-buffalo-red transition-colors"
                    >
                      (716) 559-5955
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="size-5 text-buffalo-red flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy">Service Area</h3>
                    <p className="text-muted">
                      Buffalo &amp; Western New York
                      <br />
                      Erie &amp; Niagara Counties
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-soft-gray border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold text-navy">Business Hours</h3>
                <p className="text-muted mt-2 text-sm leading-relaxed">
                  Monday – Friday: 9:00 AM – 5:00 PM EST
                  <br />
                  We typically respond within one business day.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
