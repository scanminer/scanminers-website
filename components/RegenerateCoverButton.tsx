"use client";

import React, { useEffect, useState } from "react";
import type { ApiResponse } from "@/types/api";

type RunStatusPayload = { hasRun?: boolean; status?: string; conclusion?: string | null; url?: string };
type ErrorInfo = { error?: string };

export function RegenerateCoverButton({ slug, path }: { slug: string; path?: string }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");
  const REPO = (process.env.GH_REPO as string) || (process.env.NEXT_PUBLIC_GH_REPO as string) || "scanminer/scanminers-website";
  const [lastBranch, setLastBranch] = useState<string>("");
  const [run, setRun] = useState<RunStatusPayload | null>(null);

  // Load last used branch for this slug
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const v = window.localStorage?.getItem(`branch_for_slug:${slug}`) || '';
    setLastBranch(v);
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const b = lastBranch || 'main';
      try {
        const r = await fetch(`/api/admin/image-run-status?branch=${encodeURIComponent(b)}`, { cache: 'no-store' });
        const data: ApiResponse<RunStatusPayload & ErrorInfo> = await r.json();
        if (!cancelled) {
          if (data.success && data.hasRun) {
            setRun({ status: data.status || "unknown", conclusion: data.conclusion, url: data.url });
          } else if (data.success) {
            setRun(null);
          }
        }
      } catch {}
    }
    if (lastBranch) load();
    return () => { cancelled = true; };
  }, [lastBranch]);

  async function onClick() {
    try {
      setBusy(true);
      setStatus("");
      const token = (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('ADMIN_ACTION_TOKEN')) || prompt('Admin Action Token (stored locally)') || '';
      if (!token) { setStatus('Missing token'); setBusy(false); return; }
      if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem('ADMIN_ACTION_TOKEN', token);
  const branch = prompt('Branch to operate on (default: main)', lastBranch || 'main') || 'main';
      const promptOverride = prompt('Optional prompt override (leave blank to use saved prompt)') || undefined;
      const body: Record<string, unknown> = { slug, branch };
      if (promptOverride) body.prompt = promptOverride;
      if (path) body.post_path = path;
      const r = await fetch('/api/images/regenerate', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-admin-action-token': token },
        body: JSON.stringify(body),
      });
      if (r.status === 202) {
        setStatus('Queued. Check GitHub Actions.');
        setRun({ status: 'queued' });
        setLastBranch(branch);
      }
      else setStatus('Failed: ' + (await r.text()));
      if (typeof window !== 'undefined') window.localStorage?.setItem(`branch_for_slug:${slug}`, branch);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatus('Error: ' + msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button onClick={onClick} disabled={busy} className="text-indigo-700 underline disabled:opacity-50">Regenerate Cover (AI)</button>
      <span className="text-xs text-gray-700">
        {run ? (
          <>
            Run: {run.status}
            {run.conclusion ? ` (${run.conclusion})` : null}
            {run.url && (
              <>
                {' '}
                <a className="underline" href={run.url} target="_blank" rel="noreferrer">open</a>
              </>
            )}
            {` `}
            <a className="underline" href={`https://github.com/${REPO}/actions/workflows/regenerate-image.yml?query=branch%3A${encodeURIComponent(lastBranch || 'main')}`} target="_blank" rel="noreferrer">view runs</a>
          </>
        ) : status ? status : null}
      </span>
    </span>
  );
}
