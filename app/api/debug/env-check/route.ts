import { NextResponse } from "next/server";

/**
 * Diagnostic endpoint to check which environment variables are loaded
 * SECURITY: Should be protected or removed in production after debugging
 */
export async function GET() {
  // Only allow access if admin auth is configured
  const adminPass = process.env.ADMIN_PASS;
  if (!adminPass) {
    return NextResponse.json(
      { error: "Unauthorized - Admin not configured" },
      { status: 401 }
    );
  }

  const envCheck = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    
    // Core functionality checks
    turnstile: {
      siteKey: !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      siteKeyValue: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? 
        `${process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY.substring(0, 10)}...` : 'NOT SET',
      secretKey: !!process.env.TURNSTILE_SECRET_KEY,
      secretKeyValue: process.env.TURNSTILE_SECRET_KEY ? 
        `${process.env.TURNSTILE_SECRET_KEY.substring(0, 10)}...` : 'NOT SET',
    },
    
    email: {
      resendApiKey: !!process.env.RESEND_API_KEY,
      resendApiKeyValue: process.env.RESEND_API_KEY ? 
        `${process.env.RESEND_API_KEY.substring(0, 8)}...` : 'NOT SET',
      from: process.env.RESEND_FROM || 'NOT SET',
      to: process.env.RESEND_TO || 'NOT SET',
    },
    
    auth: {
      nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT SET',
      nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      githubClientId: !!process.env.GITHUB_OAUTH_CLIENT_ID,
      githubClientIdValue: process.env.GITHUB_OAUTH_CLIENT_ID ? 
        `${process.env.GITHUB_OAUTH_CLIENT_ID.substring(0, 12)}...` : 'NOT SET',
      githubClientSecret: !!process.env.GITHUB_OAUTH_CLIENT_SECRET,
      googleClientId: !!process.env.GOOGLE_CLIENT_ID,
      googleClientIdValue: process.env.GOOGLE_CLIENT_ID ? 
        `${process.env.GOOGLE_CLIENT_ID.substring(0, 12)}...` : 'NOT SET',
      googleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      allowedDomains: process.env.ADMIN_ALLOWED_EMAIL_DOMAINS || 'NOT SET',
      allowedEmails: process.env.ADMIN_ALLOWED_EMAILS || 'NOT SET',
      adminUser: process.env.ADMIN_USER || 'NOT SET',
      adminPass: !!process.env.ADMIN_PASS,
      enablePasswordLogin: process.env.ENABLE_ADMIN_PASSWORD_LOGIN !== 'false',
    },
    
    ai: {
      openaiApiKey: !!process.env.OPENAI_API_KEY,
      openaiApiKeyValue: process.env.OPENAI_API_KEY ? 
        `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'NOT SET',
      openaiModel: process.env.OPENAI_MODEL || 'NOT SET',
      perplexityKey: !!process.env.PERPLEXITY_KEY,
    },
    
    site: {
      publicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
      sentryDsn: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
      sentryEnvironment: process.env.SENTRY_ENVIRONMENT || 'NOT SET',
      cfWebAnalyticsToken: !!process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN,
    },
    
    github: {
      ghRepo: process.env.GH_REPO || 'NOT SET',
      ghToken: !!process.env.GH_TOKEN,
      contentBotToken: !!process.env.CONTENT_BOT_TOKEN,
    },
    
    // Count total env vars (approximate)
    totalEnvVars: Object.keys(process.env).length,
    
    // D1 binding check (Cloudflare specific)
    d1Binding: typeof (globalThis as Record<string, unknown>).LEADS_DB !== 'undefined',
  };

  return NextResponse.json(envCheck, {
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}
