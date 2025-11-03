"use client";

import { useState } from "react";

type ApiResponse =
  | { ok: true; slug: string; filePath: string; branch?: string }
  | { ok: false; error: string };

export default function InitiateForm() {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [tags, setTags] = useState("");
  const [res, setRes] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setRes(null);
    try {
      const r = await fetch("/api/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          context,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      const data = (await r.json()) as ApiResponse;
      setRes(data);
    } catch (err) {
      setRes({ ok: false, error: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  const briefPath =
    res && "ok" in res && res.ok ? res.filePath : undefined;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Initiate a New Brief</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title *</label>
          <input
            className="mt-1 w-full rounded border p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Using LiDAR for Tailings Dam Monitoring"
            required
            minLength={5}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Context</label>
          <textarea
            className="mt-1 w-full rounded border p-2 min-h-[120px]"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Audience, Source Pack, goals, constraints…"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Tags (comma-separated)</label>
          <input
            className="mt-1 w-full rounded border p-2"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="LiDAR, TSF, GISTM"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Creating…" : "Create Brief"}
        </button>
      </form>

      {res && (
        <div className="rounded border p-3 text-sm">
          {"ok" in res && res.ok ? (
            <div className="space-y-2">
              <div>✅ Brief created.</div>
              <div>
                <strong>Slug:</strong> {res.slug}
              </div>
              <div>
                <strong>File:</strong> <code>{res.filePath}</code>
              </div>
              {res.branch && (
                <div>
                  <strong>Branch:</strong> <code>{res.branch}</code>
                </div>
              )}
              <div className="pt-2">
                <strong>Next:</strong> Run the generator with:
                <pre className="mt-1 whitespace-pre-wrap break-all rounded bg-gray-100 p-2">
                  {`node scripts/generate-draft-with-gpt.mjs ${briefPath}`}
                </pre>
              </div>
            </div>
          ) : (
            <div>
              {(() => {
                if (res && "ok" in res && !res.ok) {
                  return `❌ ${res.error}`;
                }
                return "❌ Something went wrong.";
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
