"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, Github, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";

type LoginFormProps = {
  nextPath: string;
  allowPasswordLogin: boolean;
  githubEnabled: boolean;
  googleEnabled: boolean;
  passwordConfigured: boolean;
};

export function LoginForm({
  nextPath,
  allowPasswordLogin,
  githubEnabled,
  googleEnabled,
  passwordConfigured,
}: LoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<
    "github" | "google" | "password" | null
  >(null);

  function handleGitHubLogin() {
    if (!githubEnabled) return;
    setError(null);
    setPending("github");
    void signIn("github", { callbackUrl: nextPath || "/admin" });
  }

  function handleGoogleLogin() {
    if (!googleEnabled) return;
    setError(null);
    setPending("google");
    void signIn("google", { callbackUrl: nextPath || "/admin" });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!allowPasswordLogin || !passwordConfigured) {
      setError("Password login is not configured");
      return;
    }

    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    setPending("password");
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      callbackUrl: nextPath || "/admin",
      username,
      password,
    });

    if (result?.ok && result.url) {
      setUsername("admin");
      setPassword("");
      router.push(result.url);
      router.refresh();
    } else {
      setError(result?.error || "Invalid username or password");
      setPending(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Password login form - PRIMARY AUTH METHOD */}
      {allowPasswordLogin ? (
        <>
          {!passwordConfigured && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Admin password not configured</p>
                <p className="mt-1 text-red-200/80">
                  Set <code className="bg-black/30 px-1">ADMIN_PASS</code>{" "}
                  environment variable to enable admin login.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-white/70">Username</span>
              <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-black/20 px-4 py-3">
                <Shield className="h-4 w-4 text-white/50" />
                <input
                  type="text"
                  className="w-full bg-transparent text-base text-white placeholder-white/40 focus:outline-none"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  disabled={!passwordConfigured}
                />
              </div>
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span className="text-white/70">Password</span>
              <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-black/20 px-4 py-3">
                <Shield className="h-4 w-4 text-white/50" />
                <input
                  type="password"
                  className="w-full bg-transparent text-base text-white placeholder-white/40 focus:outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={!passwordConfigured}
                />
              </div>
            </label>

            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3 text-base font-medium text-slate-900 shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={pending === "password" || !passwordConfigured}
            >
              {pending === "password" ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                </span>
              ) : (
                "Sign in with password"
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-yellow-100">
          <p>
            Password login is disabled. Set{" "}
            <code className="bg-black/30 px-1">
              ENABLE_ADMIN_PASSWORD_LOGIN=true
            </code>{" "}
            to enable.
          </p>
        </div>
      )}

      {/* Optional: GitHub OAuth as secondary method */}
      {githubEnabled && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-white/50">Or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGitHubLogin}
            disabled={pending === "github"}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-base font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending === "github" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Github className="h-4 w-4" />
            )}
            Continue with GitHub
          </button>
        </>
      )}

      {/* Optional: Google OAuth for Google Workspace */}
      {googleEnabled && (
        <>
          {!githubEnabled && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-white/50">Or</span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={pending === "google"}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-base font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </button>
        </>
      )}
    </div>
  );
}
