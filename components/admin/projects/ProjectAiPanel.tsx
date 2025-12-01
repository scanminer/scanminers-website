"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  generateProjectSummaryAction,
  generateKickoffEmailAction,
  generateDataRequestEmailAction,
} from "@/app/admin/projects/[id]/ai-actions";
import {
  sendProjectEmailAction,
  type SendProjectEmailInput,
} from "@/app/admin/projects/[id]/actions";

type EmailType = "kickoff" | "data-request" | "follow-up" | "custom";

export function ProjectAiPanel(props: {
  projectId: string;
  initialSummary?: string | null;
  clientEmail?: string | null;
}) {
  const { projectId, initialSummary, clientEmail } = props;
  const [summary, setSummary] = useState(initialSummary ?? "");
  const [emailDraft, setEmailDraft] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailTo, setEmailTo] = useState(clientEmail ?? "");
  const [emailType, setEmailType] = useState<EmailType>("kickoff");
  const [mode, setMode] = useState<"summary" | "kickoff" | "data" | "sending" | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function clearMessages() {
    setError(null);
    setSuccessMessage(null);
  }

  function handleGenerateSummary() {
    clearMessages();
    setMode("summary");
    startTransition(async () => {
      try {
        const result = await generateProjectSummaryAction(projectId);
        if (!result?.success) {
          setError(result?.message || "Failed to generate summary.");
          setMode(null);
          return;
        }
        setSummary(result.summary || "");
        setMode(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setMode(null);
      }
    });
  }

  function handleKickoffEmail() {
    clearMessages();
    setMode("kickoff");
    setEmailType("kickoff");
    startTransition(async () => {
      try {
        const result = await generateKickoffEmailAction(projectId);
        if (!result?.success) {
          setError(result?.message || "Failed to generate kickoff email.");
          setMode(null);
          return;
        }
        setEmailDraft(result.emailDraft || "");
        setEmailSubject("Project Kickoff - Scanminers");
        if (result.clientEmail) setEmailTo(result.clientEmail);
        setMode(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setMode(null);
      }
    });
  }

  function handleDataRequestEmail() {
    clearMessages();
    setMode("data");
    setEmailType("data-request");
    startTransition(async () => {
      try {
        const result = await generateDataRequestEmailAction(projectId);
        if (!result?.success) {
          setError(result?.message || "Failed to generate data request email.");
          setMode(null);
          return;
        }
        setEmailDraft(result.emailDraft || "");
        setEmailSubject("Data Request - Scanminers Project");
        if (result.clientEmail) setEmailTo(result.clientEmail);
        setMode(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setMode(null);
      }
    });
  }

  function handleSendEmail() {
    if (!emailTo || !emailSubject || !emailDraft) {
      setError("Please fill in all email fields.");
      return;
    }

    clearMessages();
    setMode("sending");
    startTransition(async () => {
      try {
        const input: SendProjectEmailInput = {
          projectId,
          to: emailTo,
          subject: emailSubject,
          body: emailDraft,
          emailType,
        };
        const result = await sendProjectEmailAction(input);
        if (!result.success) {
          setError(result.message || "Failed to send email.");
          setMode(null);
          return;
        }
        setSuccessMessage("Email sent successfully to " + emailTo);
        setEmailDraft("");
        setEmailSubject("");
        setMode(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send email");
        setMode(null);
      }
    });
  }

  const hasSummary = !!summary;
  const hasEmailDraft = !!emailDraft;
  const mailtoHref = hasEmailDraft
    ? "mailto:" + encodeURIComponent(emailTo || "") + "?subject=" + encodeURIComponent(emailSubject || "Project Update") + "&body=" + encodeURIComponent(emailDraft)
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
            {isPending && mode === "summary" ? "Summarizing..." : "Summarize project"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={handleKickoffEmail}
          >
            {isPending && mode === "kickoff" ? "Drafting..." : "Kickoff email"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={handleDataRequestEmail}
          >
            {isPending && mode === "data" ? "Drafting..." : "Data request email"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-900/20 border border-red-500/30 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-md bg-green-900/20 border border-green-500/30 px-3 py-2 text-sm text-green-300">
          {successMessage}
        </div>
      )}

      {hasSummary && (
        <div className="space-y-1 text-sm">
          <p className="text-xs font-semibold text-muted-foreground">
            Project summary
          </p>
          <p className="whitespace-pre-wrap rounded-lg bg-muted/40 p-3 leading-relaxed text-foreground">
            {summary}
          </p>
        </div>
      )}

      {hasEmailDraft && (
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-muted-foreground">
              Email draft
            </p>
            <span className="text-xs text-muted-foreground capitalize">
              Type: {emailType.replace("-", " ")}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">To:</label>
            <Input
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="client@example.com"
              className="text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Subject:</label>
            <Input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Email subject"
              className="text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Body:</label>
            <Textarea
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              className="min-h-[200px] text-sm font-mono"
              placeholder="Email content..."
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              type="button"
              size="sm"
              onClick={handleSendEmail}
              disabled={isPending || !emailTo || !emailSubject || !emailDraft}
            >
              {isPending && mode === "sending" ? "Sending..." : "Send via Resend"}
            </Button>
            {mailtoHref && (
              <Button asChild size="sm" variant="outline">
                <a href={mailtoHref}>Open in email client</a>
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setEmailDraft("");
                setEmailSubject("");
                clearMessages();
              }}
            >
              Clear draft
            </Button>
          </div>
        </div>
      )}

      {!hasSummary && !hasEmailDraft && !isPending && (
        <p className="text-xs text-muted-foreground">
          Use the buttons above to generate a brief internal summary or
          client-ready emails for this project.
        </p>
      )}
    </div>
  );
}
