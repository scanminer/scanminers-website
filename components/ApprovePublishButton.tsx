"use client";

import { useState } from "react";

type KindLocal = "insight" | "case-study" | "brief";

export function ApprovePublishButton({ kind, slug }: { kind: KindLocal; slug: string }) {
  const [busy, setBusy] = useState(false);
  const [prUrl, setPrUrl] = useState<string | null>(null);

  async function onClick() {
    try {
      setBusy(true);
      setPrUrl(null);
  const apiKind: "insight" | "case" | "brief" = kind === "case-study" ? "case" : (kind as "insight" | "brief");
      const res = await fetch("/api/admin/approve-publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, kind: apiKind }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed");
      setPrUrl(data.prUrl as string);
  // Optional alert for quick feedback
  alert(`Opened PR: ${data.prUrl}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
  alert(`Error: ${msg}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onClick}
        disabled={busy}
        className="px-3 py-1 rounded bg-black text-white disabled:opacity-60"
        title="Set review_status=approved & publishedAt=now, open PR"
      >
        {busy ? "Publishing..." : "Approve & Publish"}
      </button>
      {prUrl && (
        <a href={prUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-xs">
          PR
        </a>
      )}
    </div>
  );
}
