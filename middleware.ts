import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { resolveAdminAuthConfig } from "@/lib/admin-auth";

const ADMIN_MATCHERS = [/^\/admin(?:\/?|$)/, /^\/api\/admin(?:\/?|$)/];

export async function middleware(req: NextRequest) {
  const config = resolveAdminAuthConfig();
  if (config.bypass) {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;
  const isProtected = ADMIN_MATCHERS.some((pattern) => pattern.test(pathname));
  if (!isProtected) {
    return NextResponse.next();
  }

  const isLoginPage = pathname.startsWith("/admin/login");
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAdmin = Boolean(token?.isAdmin);

  if (isAdmin) {
    if (isLoginPage) {
      const redirectTarget = req.nextUrl.searchParams.get("next") || "/admin";
      return NextResponse.redirect(new URL(redirectTarget, req.url));
    }
    return NextResponse.next();
  }

  if (isLoginPage) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", req.url);
  const search = req.nextUrl.search || "";
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
