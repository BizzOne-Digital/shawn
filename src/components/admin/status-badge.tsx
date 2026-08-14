import { Badge } from "@/components/ui/badge";
import { listingStatusLabels, campaignStatusLabels } from "@/lib/admin-utils";
import type { ListingStatus, CampaignStatus, LeadStatus, ReportStatus } from "@prisma/client";

const listingVariants: Record<ListingStatus, "default" | "secondary" | "destructive" | "accent" | "outline"> = {
  DRAFT: "secondary",
  PENDING_REVIEW: "accent",
  CHANGES_REQUESTED: "outline",
  APPROVED: "default",
  PUBLISHED: "default",
  REJECTED: "destructive",
  SUSPENDED: "destructive",
  ARCHIVED: "secondary",
};

const campaignVariants: Record<CampaignStatus, "default" | "secondary" | "destructive" | "accent" | "outline"> = {
  DRAFT: "secondary",
  PENDING_APPROVAL: "accent",
  ACTIVE: "default",
  PAUSED: "outline",
  REJECTED: "destructive",
  EXPIRED: "secondary",
  COMPLETED: "default",
};

const leadVariants: Record<LeadStatus, "default" | "secondary" | "destructive" | "accent" | "outline"> = {
  NEW: "accent",
  CONTACTED: "outline",
  QUALIFIED: "default",
  CONVERTED: "default",
  CLOSED: "secondary",
  SPAM: "destructive",
};

const reportVariants: Record<ReportStatus, "default" | "secondary" | "destructive" | "accent" | "outline"> = {
  PENDING: "accent",
  REVIEWED: "outline",
  RESOLVED: "default",
  DISMISSED: "secondary",
};

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return (
    <Badge variant={listingVariants[status]}>
      {listingStatusLabels[status]}
    </Badge>
  );
}

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <Badge variant={campaignVariants[status]}>
      {campaignStatusLabels[status]}
    </Badge>
  );
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant={leadVariants[status]}>
      {status.replace("_", " ")}
    </Badge>
  );
}

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return (
    <Badge variant={reportVariants[status]}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}
