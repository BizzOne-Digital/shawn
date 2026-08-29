import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { ListingStatusBadge } from "@/components/admin/status-badge";
import { ModerationActions } from "@/components/admin/moderation-actions";
import { BusinessEditForm } from "@/components/admin/business-edit-form";
import { formatDate } from "@/lib/admin-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ModerationDetailPage({ params }: Props) {
  const { id } = await params;

  const [business, categories, moderationHistory] = await Promise.all([
    db.business.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        category: true,
        subcategory: true,
        images: { orderBy: { sortOrder: "asc" }, take: 5 },
      },
    }),
    db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    db.moderationAction.findMany({
      where: { businessId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  if (!business) notFound();

  return (
    <div>
      <PageHeader
        title={business.name}
        description={`Submitted by ${business.owner.name ?? business.owner.email}`}
      >
        <Button variant="outline" asChild>
          <Link href="/admin/moderation">
            <ArrowLeft className="h-4 w-4" />
            Back to Queue
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Listing Details</CardTitle>
                <ListingStatusBadge status={business.status} />
              </div>
            </CardHeader>
            <CardContent>
              <BusinessEditForm
                action="update"
                businessId={business.id}
                categories={categories}
                business={{
                  name: business.name,
                  slug: business.slug,
                  description: business.description ?? "",
                  shortDescription: business.shortDescription ?? "",
                  status: business.status,
                  address: business.address ?? "",
                  city: business.city ?? "",
                  state: business.state,
                  zipCode: business.zipCode ?? "",
                  phone: business.phone ?? "",
                  publicEmail: business.publicEmail ?? "",
                  website: business.website ?? "",
                  isVerified: business.isVerified,
                  isFeatured: business.isFeatured,
                  categoryId: business.categoryId ?? "",
                  subcategoryId: business.subcategoryId ?? "",
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Actions</CardTitle>
              <CardDescription>Approve, reject, or request changes</CardDescription>
            </CardHeader>
            <CardContent>
              <ModerationActions
                businessId={business.id}
                categories={categories}
                currentCategoryId={business.categoryId}
                currentSubcategoryId={business.subcategoryId}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Owner Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><span className="text-muted">Business Name:</span> {business.owner.name ?? "—"}</p>
              <p><span className="text-muted">Email:</span> {business.owner.email}</p>
              {business.suggestedCategory && (
                <p><span className="text-muted">Suggested Category:</span> {business.suggestedCategory}</p>
              )}
              <p><span className="text-muted">Submitted:</span> {formatDate(business.createdAt)}</p>
            </CardContent>
          </Card>

          {moderationHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {moderationHistory.map((action) => (
                  <div key={action.id} className="border-b border-border pb-3 last:border-0">
                    <p className="font-medium text-sm">{action.action.replace(/_/g, " ")}</p>
                    {action.message && (
                      <p className="text-sm text-muted mt-1">{action.message}</p>
                    )}
                    <p className="text-xs text-muted mt-1">{formatDate(action.createdAt)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
