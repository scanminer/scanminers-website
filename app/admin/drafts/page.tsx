"use client";

import { useState } from "react";

type GenType = "insight" | "case" | "brief";

export default function DraftsPage() {
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [type, setType] = useState<GenType>("insight");
  const [createPR, setCreatePR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ mdx: string; prUrl?: string } | null>(null);

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const r = await fetch("/api/admin/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, context, type, createPR }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) {
        throw new Error(data?.error || `HTTP ${r.status}`);
      }
      setResult({ mdx: data.mdx, prUrl: data.prUrl });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Drafts</h1>

      <form onSubmit={onGenerate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Type</label>
          <select
            className="mt-1 w-full rounded border p-2"
            value={type}
            onChange={(e) => setType(e.target.value as GenType)}
          >
            <option value="insight">Insight</option>
            <option value="case">Case Study</option>
            <option value="brief">Brief</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Topic</label>
          <input
            className="mt-1 w-full rounded border p-2"
            placeholder="e.g., Lithium brine exploration in salar environments"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            minLength={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Context (optional)</label>
          <textarea
            className="mt-1 w-full rounded border p-2 h-24"
            placeholder="Focus, target readers, regions, data sources, constraints…"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={createPR} onChange={(e) => setCreatePR(e.target.checked)} />
            <span>Create PR automatically (requires GH_REPO + CONTENT_BOT_TOKEN)</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !topic}
          className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate Draft"}
        </button>
      </form>

      {error && <div className="rounded border border-red-300 bg-red-50 p-3 text-red-700">{error}</div>}

      {result && (
        <div className="space-y-3">
          {result.prUrl ? (
            <div className="rounded border border-emerald-300 bg-emerald-50 p-3">
              PR created: {" "}
              <a className="underline" href={result.prUrl} target="_blank" rel="noreferrer">
                {result.prUrl}
              </a>
            </div>
          ) : (
            <div className="rounded border border-amber-300 bg-amber-50 p-3">No PR created — copy the MDX below and add it manually.</div>
          )}
          <label className="block text-sm font-medium">Generated MDX</label>
          <textarea className="w-full h-96 rounded border p-2 font-mono text-sm" readOnly value={result.mdx} />
        </div>
      )}
    </div>
  );
}
