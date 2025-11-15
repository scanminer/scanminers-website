"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield } from "lucide-react";
import type { ApiResponse } from "@/types/api";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!password) {
      setError("Password is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as ApiResponse<{ error?: string }>;
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || data?.error || "Invalid password");
      }
      setPassword("");
      router.push(nextPath || "/admin");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="flex flex-col gap-2 text-sm">
        <span className="text-white/70">Admin password</span>
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
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Checking…</span>
        ) : (
          "Enter admin"
        )}
      </button>
    </form>
  );
}
