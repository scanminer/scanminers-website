import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { getAdminSession } from "@/lib/admin-session";
import { getAllowlistSummary, resolveAdminAuthConfig } from "@/lib/admin-auth";

// Force dynamic rendering to avoid build-time NextAuth initialization
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Login",
};

type SearchParams = Record<string, string | string[] | undefined>;

function normalizeNextPath(next?: string | string[]): string {
  if (!next) return "/admin";
  const value = Array.isArray(next) ? next[0] : next;
  if (!value.startsWith("/")) return "/admin";
  return value;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const nextPath = normalizeNextPath(resolvedSearchParams?.next);
  const session = await getAdminSession();
  if (session?.user?.isAdmin) {
    redirect(nextPath);
  }

  const authConfig = resolveAdminAuthConfig();
  const allowlist = getAllowlistSummary(authConfig);

  // Check if admin password is configured
  const adminPassConfigured = Boolean(process.env.ADMIN_PASS);
  const nexauthSecretConfigured = Boolean(process.env.NEXTAUTH_SECRET);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-16 text-white">
      <div className="mx-auto flex max-w-md flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            Scanminers Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Sign in to admin tools
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Secure access for drafting tools, GitHub automation, and content
            workflows.
          </p>
        </div>

        {!nexauthSecretConfigured && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
            <p className="font-medium">⚠️ Critical: NextAuth secret missing</p>
            <p className="mt-1 text-red-200/80">
              Set <code className="bg-black/30 px-1">NEXTAUTH_SECRET</code>{" "}
              environment variable.
            </p>
          </div>
        )}

        {!authConfig.githubProviderEnabled && (
          <div className="rounded-2xl border border-blue-500/40 bg-blue-500/10 p-4 text-sm text-blue-100">
            <p>
              GitHub OAuth isn&apos;t configured (optional). Set{" "}
              <code className="bg-black/30 px-1">GITHUB_OAUTH_CLIENT_ID</code>{" "}
              and{" "}
              <code className="bg-black/30 px-1">
                GITHUB_OAUTH_CLIENT_SECRET
              </code>{" "}
              to enable SSO.
            </p>
          </div>
        )}

        {!authConfig.googleProviderEnabled && (
          <div className="rounded-2xl border border-blue-500/40 bg-blue-500/10 p-4 text-sm text-blue-100">
            <p>
              Google OAuth isn&apos;t configured (optional). Set{" "}
              <code className="bg-black/30 px-1">GOOGLE_CLIENT_ID</code> and{" "}
              <code className="bg-black/30 px-1">GOOGLE_CLIENT_SECRET</code> to
              enable Google Workspace SSO.
            </p>
          </div>
        )}

        <LoginForm
          nextPath={nextPath}
          allowPasswordLogin={authConfig.passwordFallbackEnabled}
          githubEnabled={authConfig.githubProviderEnabled}
          googleEnabled={authConfig.googleProviderEnabled}
          passwordConfigured={adminPassConfigured}
        />
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/70">
          <p className="font-semibold text-white">Access limited to:</p>
          <ul className="mt-2 space-y-1">
            <li>
              Emails:{" "}
              {allowlist.emails.length ? (
                <span>{allowlist.emails.join(", ")}</span>
              ) : (
                <span className="italic">none configured</span>
              )}
            </li>
            <li>
              Domains:{" "}
              {allowlist.domains.length ? (
                <span>{allowlist.domains.join(", ")}</span>
              ) : (
                <span className="italic">none</span>
              )}
            </li>
            <li>
              GitHub handles:{" "}
              {allowlist.github.length ? (
                <span>{allowlist.github.join(", ")}</span>
              ) : (
                <span className="italic">none</span>
              )}
            </li>
          </ul>
        </div>
        <p className="text-xs text-white/50">
          Need help? Update{" "}
          <code className="rounded bg-black/30 px-1">ADMIN_ALLOWED_EMAILS</code>{" "}
          /{" "}
          <code className="rounded bg-black/30 px-1">
            ADMIN_ALLOWED_GITHUB_LOGINS
          </code>{" "}
          and verify env health on the{" "}
          <Link className="underline" href="/admin/system">
            system page
          </Link>{" "}
          after signing in.
        </p>
      </div>
    </main>
  );
}
