import { NextResponse } from "next/server";

/**
 * Public diagnostic endpoint to check if Google OAuth environment variables are set.
 * Returns only boolean flags, no secrets.
 *
 * Visit: https://scanminers.com/api/admin/env-check
 */
export async function GET() {
  const envCheck = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    variables: {
      GOOGLE_CLIENT_ID: Boolean(process.env.GOOGLE_CLIENT_ID?.trim()),
      GOOGLE_CLIENT_SECRET: Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim()),
      NEXTAUTH_SECRET: Boolean(process.env.NEXTAUTH_SECRET?.trim()),
      ADMIN_ALLOWED_EMAIL_DOMAINS: Boolean(
        process.env.ADMIN_ALLOWED_EMAIL_DOMAINS?.trim()
      ),
    },
    googleOAuthReady: Boolean(
      process.env.GOOGLE_CLIENT_ID?.trim() &&
        process.env.GOOGLE_CLIENT_SECRET?.trim()
    ),
  };

  return NextResponse.json(envCheck, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
