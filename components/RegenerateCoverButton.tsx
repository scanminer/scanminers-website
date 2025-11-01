"use client";

import { useMemo, useState } from "react";
import { SimpleDialog } from "@/components/SimpleDialog";
import { toast } from "@/lib/toast";

type Props = {
  slug: string;
  path?: string | null;
};

export function RegenerateCoverButton({ slug, path }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [lastBranch, setLastBranch] = useState<string>("");

  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string>("");
  const [branch, setBranch] = useState<string>(lastBranch || "main");
  const [promptOverride, setPromptOverride] = useState<string>("");

  useMemo(() => {
    try {
      const saved = window.localStorage?.getItem("ADMIN_ACTION_TOKEN");
      if (saved) setToken(saved);
    } catch {}
  }, []);

  async function submit() {
    try {
      setBusy(true);
      setMsg("");
      if (!token) {
        setMsg("Missing token");
        return;
      }
      try {
        window.localStorage?.setItem("ADMIN_ACTION_TOKEN", token);
      } catch {}

      const body: Record<string, unknown> = { slug, branch };
      if (promptOverride) body.prompt = promptOverride;
      if (path) body.post_path = path;

      const res = await fetch("/api/images/regenerate", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-action-token": token },
        body: JSON.stringify(body),
      });
      if (res.status === 202) {
        toast("Queued image regeneration", "success");
        setMsg("Queued. Check GitHub Actions.");
        setLastBranch(branch);
        setOpen(false);
      } else {
        const text = await res.text();
        toast("Failed to queue: " + text, "error");
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
        disabled={busy}
        className="px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? "Queuing…" : "Regenerate Cover (AI)"}
      </button>
      {msg ? <span className="text-xs text-gray-700">{msg}</span> : null}
      <SimpleDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Regenerate Cover"
        footer={
          <>
            <button className="px-3 py-1 rounded border" onClick={() => setOpen(false)}>Cancel</button>
            <button className="px-3 py-1 rounded border bg-black text-white" onClick={submit} disabled={busy}>
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
          <label className="block text-xs text-gray-600">Branch</label>
          <input
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="main"
            className="mt-1 w-full rounded border px-2 py-1"
          />
        </div>
        <div className="text-sm">
          <label className="block text-xs text-gray-600">Prompt override (optional)</label>
          <input
            value={promptOverride}
            onChange={(e) => setPromptOverride(e.target.value)}
            placeholder="Describe desired cover"
            className="mt-1 w-full rounded border px-2 py-1"
          />
        </div>
      </SimpleDialog>
    </span>
  );
}
