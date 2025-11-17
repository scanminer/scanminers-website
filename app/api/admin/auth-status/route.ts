import { NextResponse } from "next/server";
import { resolveAdminAuthConfig } from "@/lib/admin-auth";

export async function GET() {
  const config = resolveAdminAuthConfig();

  return NextResponse.json({
    passwordEnabled: config.passwordFallbackEnabled,
    githubEnabled: config.githubProviderEnabled,
    googleEnabled: config.googleProviderEnabled,
    hasAllowlist: config.hasAllowlist,
    allowedDomains: config.allowedDomains,
    allowedEmails: config.allowedEmails,
    envCheck: {
      GOOGLE_CLIENT_ID: Boolean(process.env.GOOGLE_CLIENT_ID),
      GOOGLE_CLIENT_SECRET: Boolean(process.env.GOOGLE_CLIENT_SECRET),
      ADMIN_PASS: Boolean(process.env.ADMIN_PASS),
      NEXTAUTH_SECRET: Boolean(process.env.NEXTAUTH_SECRET),
      GITHUB_OAUTH_CLIENT_ID: Boolean(process.env.GITHUB_OAUTH_CLIENT_ID),
      GITHUB_OAUTH_CLIENT_SECRET: Boolean(
        process.env.GITHUB_OAUTH_CLIENT_SECRET
      ),
    },
  });
}
