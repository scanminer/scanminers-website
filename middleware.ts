import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { resolveAdminAuthConfig } from "@/lib/admin-auth";

const ADMIN_MATCHERS = [/^\/admin(?:\/?|$)/, /^\/api\/admin(?:\/?|$)/];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = ADMIN_MATCHERS.some((pattern) => pattern.test(pathname));
  
  if (!isProtected) {
    return NextResponse.next();
  }
  
  // SECURITY: Never allow auth bypass in production
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
  const config = resolveAdminAuthConfig();
  
  if (config.bypass) {
    if (isProduction) {
      console.error("❌ SECURITY VIOLATION: ALLOW_ADMIN_WITHOUT_AUTH is enabled in production. Rejecting request.");
      return NextResponse.json(
        { error: "Authentication bypass not allowed in production" },
        { status: 403 }
      );
    }
    console.warn("⚠️ DEV MODE: Authentication bypass active (ALLOW_ADMIN_WITHOUT_AUTH=true)");
    return NextResponse.next();
  }

  const isLoginPage = pathname.startsWith("/admin/login");
  
  // Verify authentication
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAdmin = Boolean(token?.isAdmin);

  // Redirect authenticated users away from login page
  if (isAdmin && isLoginPage) {
    const redirectTarget = req.nextUrl.searchParams.get("next") || "/admin";
    console.log(`↩️ Redirecting authenticated user from login to ${redirectTarget}`);
    return NextResponse.redirect(new URL(redirectTarget, req.url));
  }
  
  // Allow access to login page for unauthenticated users
  if (isLoginPage) {
    return NextResponse.next();
  }

  if (!isAdmin) {
    console.log(`🔒 Unauthorized access attempt to ${pathname} - redirecting to login`);
    const loginUrl = new URL("/admin/login", req.url);
    const search = req.nextUrl.search || "";
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }
  
  // Admin authenticated - allow access
  console.log(`✅ Admin access granted to ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
