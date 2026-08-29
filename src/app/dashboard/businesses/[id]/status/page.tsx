import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireBusinessOwner } from "@/lib/auth-utils";
import { getListingStatusLabel } from "@/lib/business-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { NOT_DELETED } from "@/lib/prisma-mongo-filters";

type PageProps = { params: Promise<{ id: string }> };

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  DRAFT: Clock,
  PENDING_REVIEW: Clock,
  CHANGES_REQUESTED: AlertCircle,
  APPROVED: CheckCircle,
  PUBLISHED: CheckCircle,
  REJECTED: XCircle,
  SUSPENDED: XCircle,
  ARCHIVED: XCircle,
};

export default async function BusinessStatusPage({ params }: PageProps) {
  const user = await requireBusinessOwner();
  const { id } = await params;

  const business = await db.business.findFirst({
    where: { id, ownerId: user.id, ...NOT_DELETED },
    include: {
      submissions: { orderBy: { submittedAt: "desc" } },
      moderationActions: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!business) notFound();

  const StatusIcon = STATUS_ICONS[business.status] ?? Clock;

  const timeline = [
    ...business.submissions.map((s) => ({
      date: s.submittedAt,
      title: `Submitted for review`,
      status: s.status,
      notes: s.notes,
      type: "submission" as const,
    })),
    ...business.moderationActions.map((a) => ({
      date: a.createdAt,
      title: a.action.replace(/_/g, " "),
      status: business.status,
      notes: a.message,
      type: "action" as const,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/dashboard/businesses/${id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="size-4" />
            Back to Edit
          </Button>
        </Link>
        <h1 className="font-display text-3xl font-bold text-navy">Submission Status</h1>
        <p className="text-muted mt-1">{business.name}</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-navy/10 flex items-center justify-center">
              <StatusIcon className="size-6 text-navy" />
            </div>
            <div>
              <Badge variant={business.status === "PUBLISHED" ? "default" : "secondary"} className="mb-1">
                {getListingStatusLabel(business.status)}
              </Badge>
              {business.adminFeedback && (
                <p className="text-sm text-muted mt-1">{business.adminFeedback}</p>
              )}
              {business.rejectionReason && (
                <p className="text-sm text-buffalo-red mt-1">{business.rejectionReason}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <p className="text-muted text-sm">No activity yet. Submit your business for review to get started.</p>
          ) : (
            <div className="space-y-6">
              {timeline.map((event, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="size-3 rounded-full bg-navy" />
                    {i < timeline.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1" />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className="font-medium text-navy capitalize">{event.title}</p>
                    <p className="text-xs text-muted">
                      {format(event.date, "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    {event.notes && (
                      <p className="text-sm text-muted mt-1">{event.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {business.status === "CHANGES_REQUESTED" && (
        <div className="text-center">
          <Link href={`/dashboard/businesses/${id}`}>
            <Button variant="accent">Make Changes & Resubmit</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
