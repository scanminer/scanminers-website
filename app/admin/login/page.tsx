import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, validateAdminToken } from "@/lib/admin-auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin Login",
};

function normalizeNextPath(next?: string | string[]): string {
  if (!next) return "/admin";
  const value = Array.isArray(next) ? next[0] : next;
  if (!value.startsWith("/")) return "/admin";
  return value;
}

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const envPass = process.env.ADMIN_PASS;

  if (!envPass) {
    return (
      <main className="min-h-screen px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-md rounded-2xl border bg-card p-6 text-center">
          <p className="text-sm text-red-600">ADMIN_PASS is not configured. Set it in your environment to enable admin access.</p>
        </div>
      </main>
    );
  }

  const cookieStore = await cookies();
  const cookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (cookie) {
    const isValid = await validateAdminToken(cookie, envPass);
    if (isValid) {
      redirect("/admin");
    }
  }

  const resolvedSearchParams = await searchParams;
  const nextPath = normalizeNextPath(resolvedSearchParams?.next);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-16 text-white">
      <div className="mx-auto flex max-w-md flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">Scanminers Admin</p>
          <h1 className="mt-3 text-3xl font-semibold">Enter admin password</h1>
          <p className="mt-2 text-sm text-white/70">This gates drafting tools, GitHub automation, and image regeneration.</p>
        </div>
        <LoginForm nextPath={nextPath} />
        <p className="text-xs text-white/50">
          Lost access? Update <code className="rounded bg-black/30 px-1">ADMIN_PASS</code> in your deployment environment or see the {" "}
          <Link className="underline" href="/admin/system">system page</Link> for diagnostics after login.
        </p>
      </div>
    </main>
  );
}
