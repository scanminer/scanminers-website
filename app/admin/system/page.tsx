import Link from "next/link";
import { resolveAdminAuthConfig } from "@/lib/admin-auth";

const ENV_KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN",
  "NEXT_PUBLIC_GA_MEASUREMENT_ID",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "RESEND_API_KEY",
  "RESEND_FROM",
  "RESEND_TO",
  "CONSULT_BANK_ACCOUNT_NAME",
  "CONSULT_BANK_ACCOUNT",
  "CONSULT_BANK_IBAN",
  "CONSULT_BANK_BIC",
  "CONSULT_BANK_NOTE",
  "SENTRY_DSN",
  "NEXT_PUBLIC_SENTRY_DSN",
  // Drafting / GitHub automation
  "PERPLEXITY_KEY",
  "PERPLEXITY_MODEL",
  "CONTENT_BOT_TOKEN",
  "GIT_DEFAULT_BRANCH",
  "CONTENT_DEFAULT_BRANCH",
  "ADMIN_USER",
  "ADMIN_PASS",
  "ADMIN_ALLOWED_EMAILS",
  "ADMIN_ALLOWED_EMAIL_DOMAINS",
  "ADMIN_ALLOWED_GITHUB_LOGINS",
  "NEXTAUTH_SECRET",
  "ENABLE_ADMIN_PASSWORD_LOGIN",
  "ALLOW_ADMIN_WITHOUT_AUTH",
  "GITHUB_OAUTH_CLIENT_ID",
  "GITHUB_OAUTH_CLIENT_SECRET",
  "ADMIN_ACTION_TOKEN",
  "WORKFLOW_DISPATCH_TOKEN",
  "GH_REPO",
  "NEXT_PUBLIC_GITHUB_REPO",
  "CONTENT_REPO",
  "CONTENT_AUTHOR_NAME",
  "CONTENT_AUTHOR_EMAIL",
] as const;

export default function SystemPage() {
  const entries = ENV_KEYS.map((k) => ({
    key: k,
    present: Boolean(process.env[k]),
  }));
  const repo =
    process.env.GH_REPO ||
    process.env.NEXT_PUBLIC_GITHUB_REPO ||
    process.env.CONTENT_REPO ||
    "";

  // Authentication diagnostics
  const authConfig = resolveAdminAuthConfig();
  const nexauthSecretPresent = Boolean(process.env.NEXTAUTH_SECRET);
  const adminPassPresent = Boolean(process.env.ADMIN_PASS);
  const adminUserPresent = Boolean(process.env.ADMIN_USER);
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production";

  // Security warnings
  const warnings: string[] = [];
  if (!nexauthSecretPresent) {
    warnings.push(
      "⚠️ CRITICAL: NEXTAUTH_SECRET is missing - authentication will not work"
    );
  }
  if (!adminPassPresent && authConfig.passwordFallbackEnabled) {
    warnings.push("⚠️ ADMIN_PASS is missing - password login unavailable");
  }
  if (authConfig.bypass && isProduction) {
    warnings.push(
      "🚨 SECURITY VIOLATION: ALLOW_ADMIN_WITHOUT_AUTH is enabled in production!"
    );
  }
  if (authConfig.bypass && !isProduction) {
    warnings.push(
      "⚠️ DEV MODE: Authentication bypass is active (ALLOW_ADMIN_WITHOUT_AUTH=true)"
    );
  }

  const actions = [
    { label: "Insights RSS", href: "/insights/rss.xml" },
    { label: "Case Studies RSS", href: "/case-studies/rss.xml" },
    repo
      ? { label: "GitHub Actions", href: `https://github.com/${repo}/actions` }
      : null,
    repo
      ? { label: "Releases", href: `https://github.com/${repo}/releases` }
      : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div>
      <h2 className="mb-4 text-xl font-medium">System</h2>

      {/* Authentication Status Section */}
      <div className="mb-6 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
        <h3 className="mb-3 text-lg font-medium text-slate-100">
          Authentication Status
        </h3>

        {warnings.length > 0 && (
          <div className="mb-4 space-y-2">
            {warnings.map((warning, i) => (
              <div
                key={i}
                className="rounded border border-red-500/50 bg-red-900/30 px-3 py-2 text-sm text-red-300"
              >
                {warning}
              </div>
            ))}
          </div>
        )}

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="font-medium text-slate-300">Environment:</dt>
            <dd
              className={
                isProduction ? "text-red-400 font-semibold" : "text-green-400"
              }
            >
              {isProduction ? "PRODUCTION" : "Development"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-slate-300">NEXTAUTH_SECRET:</dt>
            <dd
              className={
                nexauthSecretPresent ? "text-green-400" : "text-red-400"
              }
            >
              {nexauthSecretPresent ? "✅ Configured" : "❌ Missing"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-slate-300">ADMIN_USER:</dt>
            <dd
              className={adminUserPresent ? "text-green-400" : "text-amber-400"}
            >
              {adminUserPresent ? "✅ Configured" : "⚠️ Using default"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-slate-300">ADMIN_PASS:</dt>
            <dd
              className={adminPassPresent ? "text-green-400" : "text-red-400"}
            >
              {adminPassPresent ? "✅ Configured" : "❌ Missing"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-slate-300">Password Login:</dt>
            <dd
              className={
                authConfig.passwordFallbackEnabled
                  ? "text-green-400"
                  : "text-amber-400"
              }
            >
              {authConfig.passwordFallbackEnabled
                ? "✅ Enabled"
                : "⚠️ Disabled"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-slate-300">GitHub OAuth:</dt>
            <dd
              className={
                authConfig.githubProviderEnabled
                  ? "text-green-400"
                  : "text-slate-500"
              }
            >
              {authConfig.githubProviderEnabled
                ? "✅ Enabled"
                : "— Not configured"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-slate-300">Auth Bypass:</dt>
            <dd
              className={
                authConfig.bypass
                  ? "text-red-400 font-semibold"
                  : "text-green-400"
              }
            >
              {authConfig.bypass ? "🚨 ACTIVE" : "✅ Disabled"}
            </dd>
          </div>
        </dl>

        <div className="mt-4 rounded border border-blue-500/30 bg-blue-900/20 px-3 py-2 text-xs text-blue-300">
          <strong>Primary auth method:</strong>{" "}
          {adminPassPresent ? "Password (credentials)" : "Not configured"}
          <br />
          <strong>Secondary auth method:</strong>{" "}
          {authConfig.githubProviderEnabled ? "GitHub OAuth" : "Not configured"}
        </div>
      </div>

      {/* Environment Variables Table */}
      <h3 className="mb-3 text-lg font-medium">Environment Variables</h3>
      <div className="mb-6 overflow-x-auto">
        <table className="min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4">Env</th>
              <th className="py-2">Present</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(({ key, present }) => (
              <tr key={key} className="border-b last:border-0">
                <td className="py-2 pr-4 font-mono text-xs">{key}</td>
                <td className="py-2">{present ? "✅" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        {actions.map((a) => (
          <Link
            key={a.href}
            className="text-blue-600 hover:underline"
            href={a.href}
            target="_blank"
          >
            {a.label}
          </Link>
        ))}
      </div>

      {!repo && (
        <p className="mt-4 text-xs text-amber-700">
          Set GH_REPO (or CONTENT_REPO) to enable links to GitHub Actions and
          Releases.
        </p>
      )}
    </div>
  );
}
