import Link from "next/link";

const ENV_KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "RESEND_API_KEY",
  "RESEND_FROM",
  "RESEND_TO",
  "SENTRY_DSN",
  "NEXT_PUBLIC_SENTRY_DSN",
  "ADMIN_USER",
  "ADMIN_PASS",
  "ALLOW_ADMIN_WITHOUT_AUTH",
  "ADMIN_ACTION_TOKEN",
  "WORKFLOW_DISPATCH_TOKEN",
  "CONTENT_BOT_TOKEN",
  "GH_REPO",
] as const;

export default function SystemPage() {
  const entries = ENV_KEYS.map((k) => ({ key: k, present: Boolean(process.env[k]) }));
  const repo = process.env.GH_REPO ?? "";
  const authEnabled = Boolean(process.env.ADMIN_USER && process.env.ADMIN_PASS);
  const bypass = process.env.ALLOW_ADMIN_WITHOUT_AUTH === 'true';

  const actions = [
    { label: "Insights RSS", href: "/insights/rss.xml" },
    { label: "Case Studies RSS", href: "/case-studies/rss.xml" },
    repo ? { label: "GitHub Actions", href: `https://github.com/${repo}/actions` } : null,
    repo ? { label: "Releases", href: `https://github.com/${repo}/releases` } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div>
      <h2 className="mb-4 text-xl font-medium">System</h2>

      <div className="mb-6 rounded-md border p-3 text-sm">
        <div className="mb-1 font-medium">Admin access</div>
        {!authEnabled && !bypass && (
          <p className="text-gray-700">No basic auth configured for /admin (local dev default). Set ADMIN_USER and ADMIN_PASS to enable protection.</p>
        )}
        {authEnabled && !bypass && (
          <p className="text-gray-700">Basic auth is enabled for /admin. Use your ADMIN_USER and ADMIN_PASS to sign in.</p>
        )}
        {bypass && (
          <p className="text-amber-700">Bypass enabled: ALLOW_ADMIN_WITHOUT_AUTH=true. This skips auth locally; don’t use in production.</p>
        )}
        {!bypass && (
          <p className="mt-2 text-xs text-gray-600">Tip: For local dev, you can set <code className="font-mono">ALLOW_ADMIN_WITHOUT_AUTH=true</code> in <code className="font-mono">.env.local</code> and restart the server to bypass auth.</p>
        )}
      </div>
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
        <p className="mt-4 text-xs text-amber-700">Set GH_REPO to enable links to GitHub Actions and Releases.</p>
      )}
    </div>
  );
}
