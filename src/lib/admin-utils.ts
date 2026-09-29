import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  ModerationActionType,
  UserRole,
  Prisma,
  type ListingStatus,
  type CampaignStatus,
} from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";
import {
  canAccessAdminApi,
  canAccessAdminPanel,
  isFullAdmin,
} from "@/lib/admin-permissions";

export async function requireAdminApi(request?: Request) {
  const user = await getCurrentUser();
  if (!user || !canAccessAdminPanel(user.role)) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (request && !isFullAdmin(user.role)) {
    const pathname = new URL(request.url).pathname;
    if (!canAccessAdminApi(user.role, pathname)) {
      return { user: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
  }

  return { user, error: null };
}

export async function requireFullAdminApi() {
  const user = await getCurrentUser();
  if (!user || !isFullAdmin(user.role)) {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { user, error: null };
}

export async function getRequestIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
}

export async function recordAuditLog(params: {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  const ipAddress = await getRequestIp();
  return db.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      metadata: (params.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      ipAddress,
    },
  });
}

export async function recordModerationAction(params: {
  businessId: string;
  adminId: string;
  action: ModerationActionType;
  message?: string;
  metadata?: Record<string, unknown>;
}) {
  return db.moderationAction.create({
    data: {
      businessId: params.businessId,
      adminId: params.adminId,
      action: params.action,
      message: params.message,
      metadata: (params.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function logAdminAction(params: {
  userId: string;
  businessId?: string;
  moderationAction?: ModerationActionType;
  message?: string;
  auditAction: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  if (params.businessId && params.moderationAction) {
    await recordModerationAction({
      businessId: params.businessId,
      adminId: params.userId,
      action: params.moderationAction,
      message: params.message,
      metadata: params.metadata,
    });
  }
  await recordAuditLog({
    userId: params.userId,
    action: params.auditAction,
    entity: params.entity,
    entityId: params.entityId ?? params.businessId,
    metadata: params.metadata,
  });
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const listingStatusLabels: Record<ListingStatus, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending Review",
  CHANGES_REQUESTED: "Changes Requested",
  APPROVED: "Approved",
  PUBLISHED: "Published",
  REJECTED: "Rejected",
  SUSPENDED: "Suspended",
  ARCHIVED: "Archived",
};

export const campaignStatusLabels: Record<CampaignStatus, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending Approval",
  ACTIVE: "Active",
  PAUSED: "Paused",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  COMPLETED: "Completed",
};

export const userRoleLabels: Record<UserRole, string> = {
  VISITOR: "Visitor",
  INDIVIDUAL: "Individual Member",
  BUSINESS_OWNER: "Business Owner",
  MODERATOR: "Moderator",
  ADMIN: "Admin",
};

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}
