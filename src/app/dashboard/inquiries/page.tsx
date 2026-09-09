import Link from "next/link";
import { LeadSource } from "@prisma/client";
import { db } from "@/lib/db";
import { requireBusinessOwner } from "@/lib/auth-utils";
import { NOT_DELETED } from "@/lib/prisma-mongo-filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function CustomerInquiriesPage() {
  const user = await requireBusinessOwner();

  const businesses = await db.business.findMany({
    where: { ownerId: user.id, ...NOT_DELETED },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const businessIds = businesses.map((business) => business.id);
  const businessNames = Object.fromEntries(businesses.map((business) => [business.id, business.name]));

  const inquiries =
    businessIds.length === 0
      ? []
      : await db.lead.findMany({
          where: {
            businessId: { in: businessIds },
            source: LeadSource.BUSINESS_ENQUIRY,
          },
          orderBy: { createdAt: "desc" },
        });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/businesses" className="inline-flex items-center gap-2 text-sm text-muted hover:text-navy mb-4">
          <ArrowLeft className="size-4" />
          Back to My Businesses
        </Link>
        <h1 className="font-display text-3xl font-bold text-navy">Customer Inquiries</h1>
        <p className="text-muted mt-1">
          Messages sent from your public business listing contact forms.
        </p>
      </div>

      {businesses.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted">
            List a business first to receive customer inquiries here.
          </CardContent>
        </Card>
      ) : inquiries.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted">
            No customer inquiries yet. When visitors contact you from your listing page, they will appear here.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-lg">{inquiry.name}</CardTitle>
                    <p className="text-sm text-muted mt-1">
                      For: {inquiry.businessId ? businessNames[inquiry.businessId] ?? "Business listing" : "Business listing"}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {formatDistanceToNow(inquiry.createdAt, { addSuffix: true })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-4 text-sm">
                  <a href={`mailto:${inquiry.email}`} className="inline-flex items-center gap-2 text-navy hover:text-buffalo-red">
                    <Mail className="size-4" />
                    {inquiry.email}
                  </a>
                  {inquiry.phone && (
                    <a href={`tel:${inquiry.phone.replace(/\D/g, "")}`} className="inline-flex items-center gap-2 text-navy hover:text-buffalo-red">
                      <Phone className="size-4" />
                      {inquiry.phone}
                    </a>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-muted whitespace-pre-wrap">{inquiry.message}</p>
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: Your inquiry to ${businessNames[inquiry.businessId ?? ""] ?? "our business"}`)}`}>
                    Reply by Email
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
