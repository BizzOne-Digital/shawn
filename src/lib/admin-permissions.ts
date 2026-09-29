import { UserRole } from "@prisma/client";
import {
  MODERATOR_ADMIN_PREFIXES,
  moderatorCanAccessAdminPath as moderatorCanAccessAdminPathEdge,
} from "@/lib/admin-route-access";

/** Moderator-accessible admin UI paths (ADMIN has full access). */
export { MODERATOR_ADMIN_PREFIXES };

export function isFullAdmin(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

export function isModerator(role: UserRole): boolean {
  return role === UserRole.MODERATOR;
}

export function canAccessAdminPanel(role: UserRole): boolean {
  return isFullAdmin(role) || isModerator(role);
}

export function moderatorCanAccessAdminPath(pathname: string): boolean {
  return moderatorCanAccessAdminPathEdge(pathname);
}

export function canAccessAdminPath(role: UserRole, pathname: string): boolean {
  if (isFullAdmin(role)) return true;
  if (!isModerator(role)) return false;
  return moderatorCanAccessAdminPath(pathname);
}

/** First segment after /api/admin/ e.g. "leads", "settings" */
export function moderatorCanAccessAdminApi(pathname: string): boolean {
  const match = pathname.match(/^\/api\/admin\/([^/]+)/);
  const segment = match?.[1];
  if (!segment) return false;

  if (
    segment === "moderation" ||
    segment === "faq" ||
    segment === "fan-posts" ||
    segment === "fan-comments" ||
    segment === "businesses" ||
    segment === "leads"
  ) {
    return true;
  }

  if (segment === "settings" && pathname.startsWith("/api/admin/settings/reserved-emails")) {
    return true;
  }

  if (segment === "users" && pathname.includes("/password")) {
    return true;
  }

  return false;
}

export function canAccessAdminApi(role: UserRole, pathname: string): boolean {
  if (isFullAdmin(role)) return true;
  if (!isModerator(role)) return false;
  return moderatorCanAccessAdminApi(pathname);
}
