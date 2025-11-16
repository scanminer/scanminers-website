import Link from "next/link";

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
  const entries = ENV_KEYS.map((k) => ({ key: k, present: Boolean(process.env[k]) }));
  const repo = process.env.GH_REPO || process.env.NEXT_PUBLIC_GITHUB_REPO || process.env.CONTENT_REPO || "";

  const actions = [
    { label: "Insights RSS", href: "/insights/rss.xml" },
    { label: "Case Studies RSS", href: "/case-studies/rss.xml" },
    repo ? { label: "GitHub Actions", href: `https://github.com/${repo}/actions` } : null,
    repo ? { label: "Releases", href: `https://github.com/${repo}/releases` } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div>
      <h2 className="mb-4 text-xl font-medium">System</h2>
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
          <Link key={a.href} className="text-blue-600 hover:underline" href={a.href} target="_blank">
            {a.label}
          </Link>
        ))}
      </div>

      {!repo && (
        <p className="mt-4 text-xs text-amber-700">
          Set GH_REPO (or CONTENT_REPO) to enable links to GitHub Actions and Releases.
        </p>
      )}
    </div>
  );
}
