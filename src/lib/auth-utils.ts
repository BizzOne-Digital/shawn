import { auth } from "./auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...roles: UserRole[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) redirect("/");
  return user;
}

export async function requireAdmin() {
  return requireRole(UserRole.ADMIN, UserRole.MODERATOR);
}

export async function requireBusinessOwner() {
  return requireRole(
    UserRole.BUSINESS_OWNER,
    UserRole.ADMIN,
    UserRole.MODERATOR
  );
}

export function isAdmin(role: UserRole) {
  return role === UserRole.ADMIN || role === UserRole.MODERATOR;
}

export function isBusinessOwner(role: UserRole) {
  return role === UserRole.BUSINESS_OWNER || isAdmin(role);
}
