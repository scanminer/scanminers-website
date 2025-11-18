"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { generateLeadInsightAction } from "@/app/admin/leads/[id]/ai-actions";

type LeadValueTier = "high" | "medium" | "low" | null | undefined;
type LeadUrgency = "high" | "medium" | "low" | null | undefined;

export function LeadAiInsightPanel(props: {
  leadId: string;
  aiSummary?: string | null;
  aiTags?: string[] | null;
  aiValueTier?: LeadValueTier;
  aiUrgency?: LeadUrgency;
  aiFitScore?: number | null;
  aiConfidence?: number | null;
}) {
  const {
    leadId,
    aiSummary: initialSummary,
    aiTags: initialTags,
    aiValueTier,
    aiUrgency,
    aiFitScore,
    aiConfidence,
  } = props;

  const [aiSummary, setAiSummary] = useState(initialSummary ?? null);
  const [aiTags, setAiTags] = useState(initialTags ?? null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const hasInsight = !!aiSummary || (aiTags && aiTags.length > 0);

  function handleGenerate() {
    console.log("[AI Insight] Starting generation for lead:", leadId);
    setError(null);
    startTransition(async () => {
      try {
        const result = await generateLeadInsightAction(leadId);
        console.log("[AI Insight] Result:", result);
        if (!result?.success || !result.insight) {
          setError(result?.message || "Failed to generate insight.");
          return;
        }
        setAiSummary(result.insight.summary ?? null);
        setAiTags(result.insight.tags ?? null);
      } catch (err) {
        console.error("[AI Insight] Error:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      }
    });
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">AI insight</h2>
        <Button
          type="button"
          size="sm"
          variant={hasInsight ? "outline" : "default"}
          disabled={isPending}
          onClick={handleGenerate}
        >
          {isPending
            ? "Generating…"
            : hasInsight
            ? "Regenerate insight"
            : "Generate insight"}
        </Button>
      </div>

      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}

      <div className="mt-3 space-y-3 text-sm">
        {aiSummary ? (
          <p className="whitespace-pre-wrap rounded-lg bg-muted/40 p-3 leading-relaxed text-foreground">
            {aiSummary}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            No AI insight yet. Generate a quick summary and classification for
            this lead.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {aiValueTier ? (
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200">
              Value: {formatTier(aiValueTier)}
            </span>
          ) : null}
          {aiUrgency ? (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-200">
              Urgency: {formatTier(aiUrgency)}
            </span>
          ) : null}
          {typeof aiFitScore === "number" ? (
            <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs font-medium">
              Fit: {Math.round(aiFitScore)} / 100
            </span>
          ) : null}
          {typeof aiConfidence === "number" ? (
            <span className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs font-medium">
              Confidence: {Math.round(aiConfidence * 100)}%
            </span>
          ) : null}
        </div>

        {aiTags && aiTags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {aiTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border bg-background px-2 py-0.5 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function formatTier(value: LeadValueTier | LeadUrgency) {
  if (!value) return "—";
  if (value === "high") return "High";
  if (value === "medium") return "Medium";
  if (value === "low") return "Low";
  return String(value);
}
