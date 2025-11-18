"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  generateProjectSummaryAction,
  generateKickoffEmailAction,
  generateDataRequestEmailAction,
} from "@/app/admin/projects/[id]/ai-actions";

export function ProjectAiPanel(props: {
  projectId: string;
  initialSummary?: string | null;
  clientEmail?: string | null;
}) {
  const { projectId, initialSummary, clientEmail } = props;
  const [summary, setSummary] = useState(initialSummary ?? "");
  const [emailDraft, setEmailDraft] = useState("");
  const [emailTo, setEmailTo] = useState(clientEmail ?? "");
  const [mode, setMode] = useState<"summary" | "kickoff" | "data" | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleGenerateSummary() {
    console.log("[Project AI] Generating summary for:", projectId);
    setError(null);
    setMode("summary");
    startTransition(async () => {
      try {
        const result = await generateProjectSummaryAction(projectId);
        console.log("[Project AI] Summary result:", result);
        if (!result?.success) {
          setError(result?.message || "Failed to generate summary.");
          setMode(null);
          return;
        }
        setSummary(result.summary || "");
        setMode(null);
      } catch (err) {
        console.error("[Project AI] Summary error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setMode(null);
      }
    });
  }

  function handleKickoffEmail() {
    console.log("[Project AI] Generating kickoff email for:", projectId);
    setError(null);
    setMode("kickoff");
    startTransition(async () => {
      try {
        const result = await generateKickoffEmailAction(projectId);
        console.log("[Project AI] Kickoff result:", result);
        if (!result?.success) {
          setError(result?.message || "Failed to generate kickoff email.");
          setMode(null);
          return;
        }
        setEmailDraft(result.emailDraft || "");
        if (result.clientEmail) setEmailTo(result.clientEmail);
        setMode(null);
      } catch (err) {
        console.error("[Project AI] Kickoff error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setMode(null);
      }
    });
  }

  function handleDataRequestEmail() {
    console.log("[Project AI] Generating data request email for:", projectId);
    setError(null);
    setMode("data");
    startTransition(async () => {
      try {
        const result = await generateDataRequestEmailAction(projectId);
        console.log("[Project AI] Data request result:", result);
        if (!result?.success) {
          setError(result?.message || "Failed to generate data request email.");
          setMode(null);
          return;
        }
        setEmailDraft(result.emailDraft || "");
        if (result.clientEmail) setEmailTo(result.clientEmail);
        setMode(null);
      } catch (err) {
        console.error("[Project AI] Data request error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setMode(null);
      }
    });
  }

  const hasSummary = !!summary;
  const hasEmailDraft = !!emailDraft;
  const mailtoHref = hasEmailDraft
    ? `mailto:${encodeURIComponent(emailTo || "")}?subject=${encodeURIComponent(
        mode === "data"
          ? "Project data request"
          : mode === "kickoff"
          ? "Project kickoff"
          : "Project update"
      )}&body=${encodeURIComponent(emailDraft)}`
    : "";

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">AI support</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={handleGenerateSummary}
          >
            {isPending && mode === "summary"
              ? "Summarizing…"
              : "Summarize project"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={handleKickoffEmail}
          >
            {isPending && mode === "kickoff" ? "Drafting…" : "Kickoff email"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={handleDataRequestEmail}
          >
            {isPending && mode === "data" ? "Drafting…" : "Data request email"}
          </Button>
        </div>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {hasSummary ? (
        <div className="space-y-1 text-sm">
          <p className="text-xs font-semibold text-muted-foreground">
            Project summary
          </p>
          <p className="whitespace-pre-wrap rounded-lg bg-muted/40 p-3 leading-relaxed text-foreground">
            {summary}
          </p>
        </div>
      ) : null}

      {hasEmailDraft ? (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-muted-foreground">
              Email draft
            </p>
            {mailtoHref ? (
              <Button asChild size="sm" variant="secondary">
                <a href={mailtoHref}>Open in email client</a>
              </Button>
            ) : null}
          </div>
          <Textarea
            value={emailDraft}
            onChange={(e) => setEmailDraft(e.target.value)}
            className="min-h-[160px] text-sm"
          />
        </div>
      ) : null}

      {!hasSummary && !hasEmailDraft && !isPending ? (
        <p className="text-xs text-muted-foreground">
          Use the buttons above to generate a brief internal summary or
          client-ready emails for this project.
        </p>
      ) : null}
    </div>
  );
}
