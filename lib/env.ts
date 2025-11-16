import { z } from "zod";

// Schema for environment variables we care about. Most are optional with warnings.
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Core URLs
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),

  // Cloudflare Turnstile
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),

  // Resend
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM: z.string().optional(),
  RESEND_TO: z.string().optional(),

  // Consultation billing
  CONSULT_BANK_ACCOUNT_NAME: z.string().optional(),
  CONSULT_BANK_ACCOUNT: z.string().optional(),
  CONSULT_BANK_IBAN: z.string().optional(),
  CONSULT_BANK_BIC: z.string().optional(),
  CONSULT_BANK_NOTE: z.string().optional(),

  // Sentry
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),

  // Admin actions & image generation
  ADMIN_ACTION_TOKEN: z.string().optional(),
  WORKFLOW_DISPATCH_TOKEN: z.string().optional(),
  CONTENT_BOT_TOKEN: z.string().optional(),
  STABILITY_API_KEY: z.string().optional(),

  // Content bots rate limits
  WEEKLY_TOKENS: z.coerce.number().optional(),
  MONTHLY_TOKENS: z.coerce.number().optional(),

  // Admin basic auth
  ADMIN_USER: z.string().optional(),
  ADMIN_PASS: z.string().optional(),
  ADMIN_ALLOWED_EMAILS: z.string().optional(),
  ADMIN_ALLOWED_EMAIL_DOMAINS: z.string().optional(),
  ADMIN_ALLOWED_GITHUB_LOGINS: z.string().optional(),
  ALLOW_ADMIN_WITHOUT_AUTH: z.string().optional(),
  ENABLE_ADMIN_PASSWORD_LOGIN: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),

  // GitHub automation
  GH_REPO: z.string().optional(),
  GIT_DEFAULT_BRANCH: z.string().default("main"),
  GH_TOKEN: z.string().optional(),

  CONTENT_AUTHOR_NAME: z.string().optional(),
  CONTENT_AUTHOR_EMAIL: z.string().optional(),

  // Decap CMS GitHub OAuth
  GITHUB_OAUTH_CLIENT_ID: z.string().optional(),
  GITHUB_OAUTH_CLIENT_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,

  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN: process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,

  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,

  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM: process.env.RESEND_FROM,
  RESEND_TO: process.env.RESEND_TO,

  CONSULT_BANK_ACCOUNT_NAME: process.env.CONSULT_BANK_ACCOUNT_NAME,
  CONSULT_BANK_ACCOUNT: process.env.CONSULT_BANK_ACCOUNT,
  CONSULT_BANK_IBAN: process.env.CONSULT_BANK_IBAN,
  CONSULT_BANK_BIC: process.env.CONSULT_BANK_BIC,
  CONSULT_BANK_NOTE: process.env.CONSULT_BANK_NOTE,

  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  SENTRY_DSN: process.env.SENTRY_DSN,
  SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,

  ADMIN_ACTION_TOKEN: process.env.ADMIN_ACTION_TOKEN,
  WORKFLOW_DISPATCH_TOKEN: process.env.WORKFLOW_DISPATCH_TOKEN,
  CONTENT_BOT_TOKEN: process.env.CONTENT_BOT_TOKEN,
  STABILITY_API_KEY: process.env.STABILITY_API_KEY,

  WEEKLY_TOKENS: process.env.WEEKLY_TOKENS,
  MONTHLY_TOKENS: process.env.MONTHLY_TOKENS,

  ADMIN_USER: process.env.ADMIN_USER,
  ADMIN_PASS: process.env.ADMIN_PASS,
  ADMIN_ALLOWED_EMAILS: process.env.ADMIN_ALLOWED_EMAILS,
  ADMIN_ALLOWED_EMAIL_DOMAINS: process.env.ADMIN_ALLOWED_EMAIL_DOMAINS,
  ADMIN_ALLOWED_GITHUB_LOGINS: process.env.ADMIN_ALLOWED_GITHUB_LOGINS,
  ALLOW_ADMIN_WITHOUT_AUTH: process.env.ALLOW_ADMIN_WITHOUT_AUTH,
  ENABLE_ADMIN_PASSWORD_LOGIN: process.env.ENABLE_ADMIN_PASSWORD_LOGIN,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,

  GH_REPO: process.env.GH_REPO,
  GIT_DEFAULT_BRANCH: process.env.GIT_DEFAULT_BRANCH,
  GH_TOKEN: process.env.GH_TOKEN,

  CONTENT_AUTHOR_NAME: process.env.CONTENT_AUTHOR_NAME,
  CONTENT_AUTHOR_EMAIL: process.env.CONTENT_AUTHOR_EMAIL,

  GITHUB_OAUTH_CLIENT_ID: process.env.GITHUB_OAUTH_CLIENT_ID,
  GITHUB_OAUTH_CLIENT_SECRET: process.env.GITHUB_OAUTH_CLIENT_SECRET,
});

/**
 * Log concise warnings for missing or suspicious env configuration.
 * Non-fatal in development; in production we still only warn to avoid crashes.
 */
export function logEnvWarnings() {
  const missing: string[] = [];
  const hints: string[] = [];

  const hasAllowlist = Boolean(
    env.ADMIN_ALLOWED_EMAILS || env.ADMIN_ALLOWED_EMAIL_DOMAINS || env.ADMIN_ALLOWED_GITHUB_LOGINS
  );
  const bypassEnabled = env.ALLOW_ADMIN_WITHOUT_AUTH === "true";

  if (!env.NEXTAUTH_SECRET) missing.push("NEXTAUTH_SECRET");
  if (!env.GITHUB_OAUTH_CLIENT_ID || !env.GITHUB_OAUTH_CLIENT_SECRET) {
    hints.push("GITHUB_OAUTH_CLIENT_ID + GITHUB_OAUTH_CLIENT_SECRET (required for admin GitHub SSO)");
  }
  if (!hasAllowlist && !bypassEnabled) {
    hints.push("ADMIN_ALLOWED_EMAILS / ADMIN_ALLOWED_EMAIL_DOMAINS / ADMIN_ALLOWED_GITHUB_LOGINS");
  }
  if (env.ENABLE_ADMIN_PASSWORD_LOGIN !== "false" && !env.ADMIN_PASS) {
    hints.push("ADMIN_PASS (needed only if legacy password login stays enabled)");
  }

  // Contact + funnel forms
  if (!env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || !env.TURNSTILE_SECRET_KEY) {
    hints.push("NEXT_PUBLIC_TURNSTILE_SITE_KEY + TURNSTILE_SECRET_KEY (required for CAPTCHA-protected forms)");
  }

  if (!env.RESEND_API_KEY) hints.push("RESEND_API_KEY (required for contact + funnel emails)");
  if (!env.RESEND_FROM) hints.push("RESEND_FROM (verified sender email)");
  if (!env.RESEND_TO) hints.push("RESEND_TO (comma-separated recipients)");

  const missingConsultFields = [
    !env.CONSULT_BANK_ACCOUNT_NAME && "CONSULT_BANK_ACCOUNT_NAME",
    !env.CONSULT_BANK_ACCOUNT && "CONSULT_BANK_ACCOUNT",
    !env.CONSULT_BANK_IBAN && "CONSULT_BANK_IBAN",
    !env.CONSULT_BANK_BIC && "CONSULT_BANK_BIC",
    !env.CONSULT_BANK_NOTE && "CONSULT_BANK_NOTE",
  ].filter(Boolean) as string[];
  if (missingConsultFields.length) {
    hints.push(`Consultation billing details missing: ${missingConsultFields.join(", ")}`);
  }

  // Admin actions token
  if (!env.ADMIN_ACTION_TOKEN) hints.push("ADMIN_ACTION_TOKEN (needed to call /api/images/regenerate)");

  // GitHub automation
  if (!env.GH_REPO) missing.push("GH_REPO");
  if (!env.CONTENT_BOT_TOKEN && !env.WORKFLOW_DISPATCH_TOKEN) {
    hints.push("CONTENT_BOT_TOKEN or WORKFLOW_DISPATCH_TOKEN (one required for workflow dispatch)");
  }

  // Email
  if (!env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    hints.push("NEXT_PUBLIC_GA_MEASUREMENT_ID (needed for GA4 event tracking)");
  }
  if (!env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN) {
    hints.push("NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN (optional Cloudflare Web Analytics)");
  }

  // Public site URL
  if (!env.NEXT_PUBLIC_SITE_URL) hints.push("NEXT_PUBLIC_SITE_URL (improves absolute URLs)");

  if (!env.SENTRY_DSN) hints.push("SENTRY_DSN (server/edge error reporting)");

  if (missing.length || hints.length) {
    // Keep logs compact and readable
    const prefix = env.NODE_ENV === "production" ? "[env]" : "[env:dev]";
    if (missing.length) {
      // Missing items are more severe, but we still warn only
      console.warn(`${prefix} Missing required env vars: ${missing.join(", ")}`);
    }
    if (hints.length) {
      console.warn(`${prefix} Recommended env vars not set: ${hints.join(", ")}`);
    }
  }
}
