import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPageContent, txt } from "@/lib/content/page-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Let's Go Buffalo team. Email admin@letsgobuffalo.com or call (716) 559-5955.",
};

export default async function ContactPage() {
  const content = await getPageContent("contact");
  const email = txt(content, "info.email");
  const phone = txt(content, "info.phone");

  return (
    <div className="overflow-x-clip py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-navy">
          {txt(content, "hero.title")}
        </h1>
        <p className="mt-4 text-lg text-muted max-w-2xl">
          {txt(content, "hero.subtitle")}
        </p>

        <div className="grid lg:grid-cols-2 gap-10 mt-12">
          <Card>
            <CardHeader>
              <CardTitle>{txt(content, "form.title")}</CardTitle>
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
                    <h3 className="font-semibold text-navy">{txt(content, "info.email_label")}</h3>
                    <a
                      href={`mailto:${email}`}
                      className="text-muted hover:text-buffalo-red transition-colors"
                    >
                      {email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="size-5 text-buffalo-red flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy">{txt(content, "info.phone_label")}</h3>
                    <a
                      href={`tel:${phone.replace(/\D/g, "")}`}
                      className="text-muted hover:text-buffalo-red transition-colors"
                    >
                      {phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="size-5 text-buffalo-red flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy">{txt(content, "info.area_label")}</h3>
                    <p className="text-muted">
                      {txt(content, "info.area_line_1")}
                      <br />
                      {txt(content, "info.area_line_2")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-soft-gray border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold text-navy">{txt(content, "hours.title")}</h3>
                <p className="text-muted mt-2 text-sm leading-relaxed whitespace-pre-line">
                  {txt(content, "hours.text")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
