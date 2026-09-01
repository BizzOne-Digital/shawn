import { auth } from "./auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth(loginPath = "/login") {
  const user = await getCurrentUser();
  if (!user) redirect(loginPath);
  return user;
}

export async function requireRole(...roles: UserRole[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) redirect("/");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin-login");
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR) {
    redirect("/");
  }
  return user;
}

export async function requireBusinessOwner() {
  return requireRole(
    UserRole.BUSINESS_OWNER,
    UserRole.ADMIN,
    UserRole.MODERATOR
  );
}

export async function requireDashboardUser() {
  return requireRole(
    UserRole.BUSINESS_OWNER,
    UserRole.INDIVIDUAL,
    UserRole.ADMIN,
    UserRole.MODERATOR
  );
}

export function isIndividualMember(role: UserRole) {
  return role === UserRole.INDIVIDUAL;
}

export function isAdmin(role: UserRole) {
  return role === UserRole.ADMIN || role === UserRole.MODERATOR;
}

export function isBusinessOwner(role: UserRole) {
  return role === UserRole.BUSINESS_OWNER || isAdmin(role);
}
