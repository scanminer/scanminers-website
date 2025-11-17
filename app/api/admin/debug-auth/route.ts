import { NextResponse } from "next/server";
import { resolveAdminAuthConfig } from "@/lib/admin-auth";

export async function GET() {
  const config = resolveAdminAuthConfig();
  
  return NextResponse.json({
    passwordFallbackEnabled: config.passwordFallbackEnabled,
    githubProviderEnabled: config.githubProviderEnabled,
    hasAllowlist: config.hasAllowlist,
    envCheck: {
      ADMIN_PASS: !!process.env.ADMIN_PASS,
      ENABLE_ADMIN_PASSWORD_LOGIN: process.env.ENABLE_ADMIN_PASSWORD_LOGIN,
      GITHUB_OAUTH_CLIENT_ID: !!process.env.GITHUB_OAUTH_CLIENT_ID,
      GITHUB_OAUTH_CLIENT_SECRET: !!process.env.GITHUB_OAUTH_CLIENT_SECRET,
    }
  });
}
