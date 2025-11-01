"use client";

import { useEffect, useState } from "react";

type GenType = "insight" | "case" | "brief";

export default function DraftsPage() {
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [type, setType] = useState<GenType>("insight");
  const [createPR, setCreatePR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ mdx: string; prUrl?: string } | null>(null);

  // New Content (manual) form state
  const [newType, setNewType] = useState<GenType>("insight");
  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newSubmitting, setNewSubmitting] = useState(false);
  const [newResult, setNewResult] = useState<{ prUrl?: string; path?: string; slug?: string } | null>(null);

  // Improve with AI state
  const [improveKind, setImproveKind] = useState<GenType>("insight");
  const [improveSlug, setImproveSlug] = useState("");
  const [improvePrompt, setImprovePrompt] = useState("");
  const [improveLoading, setImproveLoading] = useState(false);
  const [improveError, setImproveError] = useState<string | null>(null);
  const [improvePreview, setImprovePreview] = useState<string>("");
  const [improveOriginal, setImproveOriginal] = useState<string>("");
  const [improveView, setImproveView] = useState<"mdx" | "diff">("mdx");
  const [diffContext, setDiffContext] = useState<number | "all">(3);
  const [improveCommitted, setImproveCommitted] = useState<string | null>(null);
  const [options, setOptions] = useState<{ insights: Array<{ slug: string; title: string; path: string }>; cases: Array<{ slug: string; title: string; path: string }>; briefs: Array<{ slug: string; title: string; path: string }>; } | null>(null);
  const [improveFilter, setImproveFilter] = useState("");
  const [regenBranch, setRegenBranch] = useState("main");
  const [regenPrompt, setRegenPrompt] = useState("");
  const [regenStatus, setRegenStatus] = useState<string>("");
  const [runInfo, setRunInfo] = useState<{ status: string; conclusion?: string | null; url?: string } | null>(null);
  // Load last used branch for selected slug (local memory)
  useEffect(() => {
    if (!improveSlug) return;
    try {
      const v = (typeof window !== 'undefined' && window.localStorage?.getItem(`branch_for_slug:${improveSlug}`)) || '';
      if (v) setRegenBranch(v);
    } catch {}
  }, [improveSlug]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch(`/api/admin/image-run-status?branch=${encodeURIComponent(regenBranch || 'main')}`, { cache: 'no-store' });
        const data = await r.json();
        if (!cancelled && data?.ok && data.hasRun) setRunInfo({ status: data.status, conclusion: data.conclusion, url: data.url });
      } catch {}
    }
    if (regenBranch) load();
    return () => { cancelled = true; };
  }, [regenBranch]);

  // Tiny fuzzy scorer: prefers contiguous matches and earlier positions.
  function fuzzyScore(query: string, target: string): number {
    if (!query) return 0.5; // neutral baseline when no query
    const q = query.toLowerCase();
    const t = target.toLowerCase();

    // Exact match or substring gets a big boost
    if (t === q) return 1000;
    const idx = t.indexOf(q);
    if (idx !== -1) return 800 - idx; // earlier substring is better

    // Subsequence match: score based on streaks and coverage
    let ti = 0;
    let streak = 0;
    let bestStreak = 0;
    let matched = 0;
    for (let i = 0; i < q.length; i++) {
      const ch = q[i];
      let found = false;
      while (ti < t.length) {
        if (t[ti] === ch) {
          matched++;
          streak++;
          bestStreak = Math.max(bestStreak, streak);
          ti++;
          found = true;
          break;
        } else {
          streak = 0; // break streak on gap
          ti++;
        }
      }
      if (!found) break;
    }
    if (matched === 0) return -Infinity; // no match at all
    // Weight: matched chars + contiguous bonus
    return matched * 10 + bestStreak * 20 - ti * 0.1; // slight penalty for later matches
  }

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const r = await fetch("/api/admin/list-content", { cache: "no-store" });
        const data = await r.json();
        if (!r.ok || !data.ok) return;
        if (!aborted) setOptions({ insights: data.insights || [], cases: data.cases || [], briefs: data.briefs || [] });
      } catch {}
    })();
    return () => {
      aborted = true;
    };
  }, []);

  useEffect(() => {
    // When type changes, preselect first slug
    if (!options) return;
    const base = improveKind === "insight" ? options.insights : improveKind === "case" ? options.cases : options.briefs;
    const list = (improveFilter ? [...base].sort((a, b) => {
      const sa = Math.max(fuzzyScore(improveFilter, a.title), fuzzyScore(improveFilter, a.slug));
      const sb = Math.max(fuzzyScore(improveFilter, b.title), fuzzyScore(improveFilter, b.slug));
      return sb - sa;
    }).filter((o) => Math.max(fuzzyScore(improveFilter, o.title), fuzzyScore(improveFilter, o.slug)) > -Infinity) : base);
    setImproveSlug(list[0]?.slug || "");
  }, [improveKind, options, improveFilter]);

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

  async function onCreateNew(e: React.FormEvent) {
    e.preventDefault();
    setNewSubmitting(true);
    setNewResult(null);
    setError(null);
    try {
      const r = await fetch("/api/admin/new-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newType,
          title: newTitle,
          summary: newSummary || undefined,
          tags: newTags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          slug: newSlug || undefined,
          createPR: true,
        }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data?.error || `HTTP ${r.status}`);
  setNewResult({ prUrl: data.prUrl, path: data.path, slug: data.slug });
  if (data.branch) setRegenBranch(data.branch);
  // Also preselect the created slug/type for quicker follow-up actions
  if (data.slug) setImproveSlug(data.slug);
  if (newType) setImproveKind(newType);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
    } finally {
      setNewSubmitting(false);
    }
  }

  async function onImprovePreview(e: React.FormEvent) {
    e.preventDefault();
    setImproveLoading(true);
    setImproveError(null);
    setImproveCommitted(null);
    setImprovePreview("");
    try {
      const r = await fetch("/api/admin/improve-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: improveKind, slug: improveSlug, prompt: improvePrompt, confirm: false }),
      });
  const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data?.error || `HTTP ${r.status}`);
  setImprovePreview(data.mdx || "");
  setImproveOriginal(data.originalMdx || "");
  setImproveView("diff");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setImproveError(msg);
    } finally {
      setImproveLoading(false);
    }
  }

  async function onImproveCommit(e: React.FormEvent) {
    e.preventDefault();
    if (!improvePreview) return;
    setImproveLoading(true);
    setImproveError(null);
    try {
      const r = await fetch("/api/admin/improve-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: improveKind, slug: improveSlug, prompt: improvePrompt, confirm: true, mdx: improvePreview }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data?.error || `HTTP ${r.status}`);
  setImproveCommitted(data.prUrl || null);
  if (data.branch) setRegenBranch(data.branch);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setImproveError(msg);
    } finally {
      setImproveLoading(false);
    }
  }

  async function onRegenerateCover(e: React.FormEvent) {
    e.preventDefault();
    setRegenStatus("");
    try {
      const token = (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('ADMIN_ACTION_TOKEN')) || prompt('Admin Action Token (stored locally)') || '';
      if (!token) { setRegenStatus('Missing token'); return; }
      if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem('ADMIN_ACTION_TOKEN', token);
      const list = options ? (improveKind === 'insight' ? options.insights : improveKind === 'case' ? options.cases : options.briefs) : [];
      const selected = list.find((o) => o.slug === improveSlug);
      const body = {
        slug: improveSlug,
        prompt: regenPrompt || undefined,
        branch: regenBranch || 'main',
        post_path: selected?.path,
      };
      const r = await fetch('/api/images/regenerate', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-admin-action-token': token },
        body: JSON.stringify(body),
      });
      if (r.status === 202) {
        setRegenStatus('Queued. Check GitHub Actions.');
        setRunInfo({ status: 'queued' });
      }
      else setRegenStatus('Failed: ' + (await r.text()));
  try { if (typeof window !== 'undefined') window.localStorage?.setItem(`branch_for_slug:${improveSlug}`, body.branch as string); } catch {}
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setRegenStatus('Error: ' + msg);
    }
  }

  // Tiny line-level diff (LCS) for MDX strings
  type DiffPart = { t: "equal" | "insert" | "delete"; text: string };
  function diffLines(a: string, b: string): DiffPart[] {
    const A = a.split(/\r?\n/);
    const B = b.split(/\r?\n/);
    const n = A.length;
    const m = B.length;
    const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        if (A[i] === B[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
        else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const parts: DiffPart[] = [];
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (A[i] === B[j]) {
        parts.push({ t: "equal", text: A[i] });
        i++; j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        parts.push({ t: "delete", text: A[i] });
        i++;
      } else {
        parts.push({ t: "insert", text: B[j] });
        j++;
      }
    }
    while (i < n) { parts.push({ t: "delete", text: A[i++] }); }
    while (j < m) { parts.push({ t: "insert", text: B[j++] }); }
    return parts;
  }

  function buildUnified(parts: DiffPart[], ctx: number | "all") {
    // Collapse long runs of equal lines while keeping ctx lines around changes
    if (ctx === "all") return parts.map((p) => ({ type: p.t, text: p.text }));
    const out: Array<{ type: DiffPart["t"] | "skip"; text: string }> = [];
    let i = 0;
    while (i < parts.length) {
      if (parts[i].t !== "equal") {
        out.push({ type: parts[i].t, text: parts[i].text });
        i++;
        continue;
      }
      // count run of equals
      let j = i;
      while (j < parts.length && parts[j].t === "equal") j++;
      const runLen = j - i;
      if (runLen <= ctx * 2) {
        for (let k = i; k < j; k++) out.push({ type: "equal", text: parts[k].text });
      } else {
        // keep first ctx and last ctx, skip middle
        for (let k = i; k < i + ctx; k++) out.push({ type: "equal", text: parts[k].text });
        out.push({ type: "skip", text: `${runLen - ctx * 2} lines hidden` });
        for (let k = j - ctx; k < j; k++) out.push({ type: "equal", text: parts[k].text });
      }
      i = j;
    }
    return out;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Drafts</h1>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">New Content (manual)</h2>
        <form onSubmit={onCreateNew} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Type</label>
            <select className="mt-1 w-full rounded border p-2" value={newType} onChange={(e) => setNewType(e.target.value as GenType)}>
              <option value="insight">Insight</option>
              <option value="case">Case Study</option>
              <option value="brief">Brief</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input className="mt-1 w-full rounded border p-2" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required minLength={4} />
          </div>
          {newType !== "brief" && (
            <div>
              <label className="block text-sm font-medium">Summary (50–160 chars)</label>
              <textarea className="mt-1 w-full rounded border p-2 h-20" value={newSummary} onChange={(e) => setNewSummary(e.target.value)} minLength={50} maxLength={300} required />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium">Tags (comma-separated, optional)</label>
            <input className="mt-1 w-full rounded border p-2" value={newTags} onChange={(e) => setNewTags(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Slug (optional)</label>
            <input className="mt-1 w-full rounded border p-2" placeholder="auto from title if blank" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} />
          </div>
          <button type="submit" className="rounded bg-black text-white px-4 py-2 disabled:opacity-50" disabled={newSubmitting || !newTitle || (newType !== "brief" && newSummary.length < 50)}>
            {newSubmitting ? "Creating…" : "Create PR"}
          </button>
        </form>
        {newResult?.prUrl && (
          <div className="rounded border border-emerald-300 bg-emerald-50 p-3">
            PR created: <a className="underline" href={newResult.prUrl} target="_blank" rel="noreferrer">{newResult.prUrl}</a>
          </div>
        )}
      </section>

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

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Improve with AI</h2>
        <form onSubmit={onImprovePreview} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium">Type</label>
              <select className="mt-1 w-full rounded border p-2" value={improveKind} onChange={(e) => setImproveKind(e.target.value as GenType)}>
                <option value="insight">Insight</option>
                <option value="case">Case Study</option>
                <option value="brief">Brief</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Slug</label>
              {options ? (
                <div className="flex gap-2">
                  <input
                    className="mt-1 w-1/2 rounded border p-2"
                    placeholder="Filter by title or slug…"
                    value={improveFilter}
                    onChange={(e) => setImproveFilter(e.target.value)}
                  />
                  <select
                    className="mt-1 w-1/2 rounded border p-2"
                    value={improveSlug}
                    onChange={(e) => setImproveSlug(e.target.value)}
                  >
                    {(() => {
                      const base = improveKind === "insight" ? options.insights : improveKind === "case" ? options.cases : options.briefs;
                      const ranked = improveFilter
                        ? [...base]
                            .map((o) => ({ o, s: Math.max(fuzzyScore(improveFilter, o.title), fuzzyScore(improveFilter, o.slug)) }))
                            .filter((x) => x.s > -Infinity)
                            .sort((a, b) => b.s - a.s)
                            .map((x) => x.o)
                        : base;
                      return ranked.slice(0, 200).map((o) => (
                        <option key={o.slug} value={o.slug}>
                          {o.title} — {o.slug}
                        </option>
                      ));
                    })()}
                  </select>
                </div>
              ) : (
                <input className="mt-1 w-full rounded border p-2" placeholder="loading…" value={improveSlug} onChange={(e) => setImproveSlug(e.target.value)} />
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Prompt</label>
            <textarea className="mt-1 w-full rounded border p-2 h-28" placeholder="What should be improved? (tone, structure, clarity, add bullets, etc.)" value={improvePrompt} onChange={(e) => setImprovePrompt(e.target.value)} required />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={improveLoading || !improveSlug || !improvePrompt} className="rounded bg-black text-white px-4 py-2 disabled:opacity-50">
              {improveLoading ? "Generating…" : "Preview Improvement"}
            </button>
            <button onClick={onImproveCommit} disabled={improveLoading || !improvePreview} className="rounded bg-emerald-700 text-white px-4 py-2 disabled:opacity-50">
              {improveLoading ? "Committing…" : "Commit to PR"}
            </button>
          </div>
        </form>
        {improveError && <div className="rounded border border-red-300 bg-red-50 p-3 text-red-700">{improveError}</div>}
        {improveCommitted && (
          <div className="rounded border border-emerald-300 bg-emerald-50 p-3">
            PR created: <a className="underline" href={improveCommitted} target="_blank" rel="noreferrer">{improveCommitted}</a>
          </div>
        )}
        {improvePreview && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Preview</label>
              <div className="ml-auto flex gap-2 text-xs">
                <button type="button" onClick={() => setImproveView("diff")} className={`px-2 py-1 rounded border ${improveView === "diff" ? "bg-black text-white" : "bg-white"}`}>Diff</button>
                <button type="button" onClick={() => setImproveView("mdx")} className={`px-2 py-1 rounded border ${improveView === "mdx" ? "bg-black text-white" : "bg-white"}`}>Full MDX</button>
                {improveView === "diff" && (
                  <select
                    className="px-2 py-1 rounded border"
                    value={diffContext === "all" ? "all" : String(diffContext)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setDiffContext(v === "all" ? "all" : Math.max(0, parseInt(v || "3", 10)));
                    }}
                    title="Context lines"
                  >
                    <option value="all">All</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="5">5</option>
                    <option value="8">8</option>
                  </select>
                )}
              </div>
            </div>
            {improveView === "mdx" ? (
              <textarea className="w-full h-96 rounded border p-2 font-mono text-sm" value={improvePreview} onChange={(e) => setImprovePreview(e.target.value)} />
            ) : (
              <pre className="w-full h-96 overflow-auto rounded border p-2 text-sm font-mono leading-5">
                {buildUnified(diffLines(improveOriginal, improvePreview), diffContext).map((p, idx) => (
                  <div key={idx} className={p.type === "equal" ? "" : p.type === "insert" ? "text-emerald-700" : p.type === "delete" ? "text-red-700" : "text-gray-500 italic"}>
                    {p.type === "equal" ? "  " : p.type === "insert" ? "+ " : p.type === "delete" ? "- " : "… "}{p.text}
                  </div>
                ))}
              </pre>
            )}
            <div className="mt-3 rounded border p-3 space-y-2">
              <div className="text-sm font-medium">Regenerate Cover (AI)</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-600">Branch</label>
                  <input className="mt-1 w-full rounded border p-2" value={regenBranch} onChange={(e) => setRegenBranch(e.target.value)} placeholder="main or feature branch" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-600">Prompt override (optional)</label>
                  <input className="mt-1 w-full rounded border p-2" value={regenPrompt} onChange={(e) => setRegenPrompt(e.target.value)} placeholder="Describe the desired cover style" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={onRegenerateCover} className="rounded bg-indigo-700 text-white px-4 py-2">Dispatch Image Generation</button>
                {runInfo ? (
                  <span className="text-xs text-gray-700">
                    Run: {runInfo.status}
                    {runInfo.conclusion ? ` (${runInfo.conclusion})` : null}
                    {runInfo.url && (
                      <>
                        {' '}
                        <a className="underline" href={runInfo.url} target="_blank" rel="noreferrer">open</a>
                      </>
                    )}
                  </span>
                ) : regenStatus ? <span className="text-sm">{regenStatus}</span> : null}
              </div>
              <p className="text-xs text-gray-600">Note: Requires server env ADMIN_ACTION_TOKEN and a GitHub token with workflow dispatch permissions configured as WORKFLOW_DISPATCH_TOKEN or CONTENT_BOT_TOKEN. The workflow opens a PR with the new image and updated MDX.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
