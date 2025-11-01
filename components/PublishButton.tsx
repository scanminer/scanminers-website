"use client";

import { useMemo, useState } from "react";
import { SimpleDialog } from "@/components/SimpleDialog";
import { toast } from "@/lib/toast";

type Props = {
  path: string | null | undefined;
  slug?: string | null;
};

export function PublishButton({ path, slug }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [prUrl, setPrUrl] = useState<string>("");
  const [lastBranch, setLastBranch] = useState<string>("");

  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string>("");
  const [branch, setBranch] = useState<string>(lastBranch || "main");
  const [mergeMethod, setMergeMethod] = useState<"merge" | "squash" | "rebase">("squash");

  useMemo(() => {
    try {
      const saved = window.localStorage?.getItem("ADMIN_ACTION_TOKEN");
      if (saved) setToken(saved);
    } catch {}
  }, []);

  async function submit() {
    try {
      if (!path) return;
      setBusy(true);
      setMsg("");
      setPrUrl("");
      if (!token) {
        setMsg("Missing token");
        return;
      }
      try {
        window.localStorage?.setItem("ADMIN_ACTION_TOKEN", token);
      } catch {}
      const res = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-action-token": token },
        body: JSON.stringify({ path, branch, title: slug ? `Publish content: ${slug}` : undefined, merge_method: mergeMethod }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setMsg(data.merged ? "Published (merged)" : "PR opened");
        toast(data.merged ? "Published (merged)" : "Publish PR opened", "success");
        if (data.pr_url) setPrUrl(data.pr_url);
        setLastBranch(branch);
        setOpen(false);
      } else {
        const text = await res.text();
        toast("Publish failed: " + text, "error");
        setMsg("Failed: " + text);
      }
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      toast("Error: " + m, "error");
      setMsg("Error: " + m);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={() => setOpen(true)}
        disabled={busy || !path}
        className="px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? "Publishing…" : !path ? "No source" : "Publish now"}
      </button>
      {msg ? (
        prUrl ? (
          <a className="text-xs text-blue-700 underline" href={prUrl} target="_blank" rel="noreferrer">
            {msg}
          </a>
        ) : (
          <span className="text-xs text-gray-700">{msg}</span>
        )
      ) : null}
      <SimpleDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Publish Content"
        footer={
          <>
            <button className="px-3 py-1 rounded border" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="px-3 py-1 rounded border bg-black text-white" onClick={submit} disabled={busy || !path}>
              {busy ? "Submitting…" : "Submit"}
            </button>
          </>
        }
      >
        <div className="text-sm">
          <label className="block text-xs text-gray-600">Admin Action Token</label>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste token"
            className="mt-1 w-full rounded border px-2 py-1"
          />
        </div>
        <div className="text-sm">
          <label className="block text-xs text-gray-600">Base branch</label>
          <input
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="main"
            className="mt-1 w-full rounded border px-2 py-1"
          />
        </div>
        <div className="text-sm">
          <label className="block text-xs text-gray-600">Merge method</label>
          <select
            value={mergeMethod}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMergeMethod(e.target.value as "merge" | "squash" | "rebase")}
            className="mt-1 w-full rounded border px-2 py-1"
          >
            <option value="squash">Squash</option>
            <option value="merge">Merge</option>
            <option value="rebase">Rebase</option>
          </select>
        </div>
      </SimpleDialog>
    </span>
  );
}
