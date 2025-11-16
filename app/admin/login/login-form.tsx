"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, Github } from "lucide-react";
import { signIn } from "next-auth/react";

type LoginFormProps = {
  nextPath: string;
  allowPasswordLogin: boolean;
  githubEnabled: boolean;
};

export function LoginForm({ nextPath, allowPasswordLogin, githubEnabled }: LoginFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"github" | "password" | null>(null);

  function handleGitHubLogin() {
    if (!githubEnabled) return;
    setError(null);
    setPending("github");
    void signIn("github", { callbackUrl: nextPath || "/admin" });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!allowPasswordLogin) return;
    if (!password) {
      setError("Password is required");
      return;
    }
    setPending("password");
    setError(null);
    const result = await signIn("legacy-password", {
      redirect: false,
      callbackUrl: nextPath || "/admin",
      password,
    });
    if (result?.ok && result.url) {
      setPassword("");
      router.push(result.url);
      router.refresh();
    } else {
      setError(result?.error || "Invalid password");
      setPending(null);
    }
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={handleGitHubLogin}
        disabled={!githubEnabled || pending === "github"}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-base font-medium text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending === "github" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
        {githubEnabled ? "Continue with GitHub" : "GitHub OAuth (not configured)"}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-900 px-2 text-white/50">Or</span>
        </div>
      </div>

      {allowPasswordLogin || true ? (
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-white/70">Legacy admin password</span>
            <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-black/20 px-4 py-3">
              <Shield className="h-4 w-4 text-white/50" />
              <input
                type="password"
                className="w-full bg-transparent text-base text-white placeholder-white/40 focus:outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </label>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3 text-base font-medium text-slate-900 shadow-lg shadow-slate-900/20"
            disabled={pending === "password"}
          >
            {pending === "password" ? (
              <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Checking…</span>
            ) : (
              "Use fallback password"
            )}
          </button>
        </form>
      ) : (
        error && <p className="text-sm text-red-300">{error}</p>
      )}
    </div>
  );
}
