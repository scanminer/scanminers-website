"use client";

import { useState } from "react";
import type { ApiResponse } from "@/types/api";

type Payload = {
  title: string;
  summary?: string;
};

export default function InitiateForm({ disabled }: { disabled?: boolean }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/initiate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, summary } satisfies Payload),
      });
      const data = (await res.json().catch(() => ({}))) as ApiResponse<{ slug?: string; error?: string }>;
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || data?.error || `Request failed (${res.status})`);
      }
      setMessage(data?.message || "Brief initiated (dev-only demo).");
      setTitle("");
      setSummary("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., LiDAR Brief for ..."
          className="w-full rounded-md border p-2"
          required
          disabled={disabled || loading}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Summary (optional)</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={4}
          className="w-full rounded-md border p-2"
          placeholder="One-liner about the brief"
          disabled={disabled || loading}
        />
      </div>
      <button
        type="submit"
        disabled={disabled || loading}
        className="rounded-md bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Submitting…" : disabled ? "Disabled in this environment" : "Create draft (dev)"}
      </button>
      {message && <p className="text-green-700">{message}</p>}
      {error && <p className="text-red-700">{error}</p>}
    </form>
  );
}
