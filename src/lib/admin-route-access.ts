/** Edge-safe admin route rules (no @prisma/client — safe for middleware). */

export const MODERATOR_ADMIN_PREFIXES = [
  "/admin/moderation",
  "/admin/faq",
  "/admin/fan-page",
  "/admin/businesses",
  "/admin/leads",
  "/admin/settings",
] as const;

export function isModeratorRole(role: string | undefined): boolean {
  return role === "MODERATOR";
}

export function isAdminRole(role: string | undefined): boolean {
  return role === "ADMIN";
}

export function isStaffRole(role: string | undefined): boolean {
  return isAdminRole(role) || isModeratorRole(role);
}

export function moderatorCanAccessAdminPath(pathname: string): boolean {
  if (pathname === "/admin") return false;
  return MODERATOR_ADMIN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
