"use client";

import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type KindLocal = "insight" | "case-study" | "brief";

export function ApprovePublishButton({ kind, slug }: { kind: KindLocal; slug: string }) {
  const [busy, setBusy] = useState(false);
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  async function performPublish() {
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
      alert(`Opened PR: ${data.prUrl}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      alert(`Error: ${msg}`);
    } finally {
      setBusy(false);
    }
  }

  const description = useMemo(
    () => (
      <div className="space-y-2">
        <p>
          Approve & Publish this {kind.replace("-", " ")} (slug: <span className="font-mono text-xs">{slug}</span>)?
        </p>
        <ul className="list-disc ml-5 text-sm">
          <li>Set <code>review_status</code> = <code>approved</code></li>
          <li>Set <code>publishedAt</code> = now (ISO)</li>
          <li>Open a PR with the change</li>
        </ul>
      </div>
    ),
    [kind, slug]
  );

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setShowConfirm(true)}
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
      <ConfirmDialog
        open={showConfirm}
        title="Approve & Publish"
        description={description}
        confirmText="Approve & Publish"
        onConfirm={() => {
          setShowConfirm(false);
          void performPublish();
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
