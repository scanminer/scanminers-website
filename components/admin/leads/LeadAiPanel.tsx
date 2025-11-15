"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateLeadReplyAction } from "@/app/admin/leads/actions";
import { trackEvent } from "@/lib/analytics";
import type { LeadStatus, LeadType } from "@/lib/lead-store";

type LeadAiPanelProps = {
  leadId: string;
  leadType: LeadType;
  status: LeadStatus;
  source: string;
  initialDraft?: string | null;
};

export function LeadAiPanel({ leadId, leadType, status, source, initialDraft }: LeadAiPanelProps) {
  const [draft, setDraft] = useState(initialDraft ?? "");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("[lead-ai-panel] failed to copy", error);
      toast.error("Unable to copy. Select the text and copy manually.");
    }
  };

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateLeadReplyAction(leadId);
      if (!result.success || !result.draft) {
        toast.error(result.message || "Failed to generate reply draft.");
        return;
      }
      setDraft(result.draft);
      setCopied(false);
      toast.success("AI draft ready — review before sending.");
      trackEvent("lead.ai_reply_generated", {
        leadId,
        type: leadType,
        source,
        status,
        length: result.draft.length,
      });
    });
  };

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">AI reply draft</p>
          <p className="text-xs text-muted-foreground">Generate and refine replies without leaving the inbox.</p>
        </div>
        <span className="text-xs text-muted-foreground">Lead #{leadId.slice(0, 5)}…</span>
      </div>

      <textarea
        className="mt-4 w-full rounded-md border bg-background p-3 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-primary"
        rows={10}
        placeholder="Reply draft will appear here."
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        disabled={isPending}
      />

      <p className="mt-2 text-xs text-muted-foreground">
        Generate a draft in Scanminers’ voice, edit as needed, then copy into your email client. Drafts are logged on the timeline for governance.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={handleGenerate} disabled={isPending}>
          {isPending ? "Generating…" : "Generate with AI"}
        </Button>
        <Button type="button" variant="outline" onClick={handleCopy} disabled={!draft.trim()}>
          {copied ? "Copied" : "Copy text"}
        </Button>
      </div>
    </div>
  );
}
