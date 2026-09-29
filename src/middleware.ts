import { edgeAuth } from "@/lib/auth-edge";
import { NextResponse } from "next/server";
import {
  isModeratorRole,
  isStaffRole,
  moderatorCanAccessAdminPath,
} from "@/lib/admin-route-access";

const ADMIN_LOGIN_PATH = "/admin-login";

export default edgeAuth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const isStaff = isStaffRole(role);
  const isModerator = isModeratorRole(role);

  if (pathname === ADMIN_LOGIN_PATH) {
    if (isLoggedIn && isStaff) {
      const dest = isModerator ? "/admin/moderation" : "/admin";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const loginUrl = new URL(ADMIN_LOGIN_PATH, req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isStaff) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (isModerator) {
      if (pathname === "/admin") {
        return NextResponse.redirect(new URL("/admin/moderation", req.url));
      }
      if (!moderatorCanAccessAdminPath(pathname)) {
        return NextResponse.redirect(new URL("/admin/moderation", req.url));
      }
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (isStaff) {
      const dest = isModerator ? "/admin/moderation" : "/admin";
      return NextResponse.redirect(new URL(dest, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/admin-login"],
};
