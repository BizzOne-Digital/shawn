import type { UserRole } from "@prisma/client";

const ADMIN_ROLES: UserRole[] = ["ADMIN", "MODERATOR"];

export function isAdminRole(role?: string | UserRole | null): boolean {
  return !!role && ADMIN_ROLES.includes(role as UserRole);
}
