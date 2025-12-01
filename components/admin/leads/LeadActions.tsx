"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import type { LeadStatus, LeadType } from "@/lib/lead-store";
import {
  markLeadAsRepliedAction,
  markLeadContactedAction,
} from "@/app/admin/leads/actions";
import { convertLeadToProjectAction } from "@/app/admin/leads/[id]/actions";

type LeadActionsProps = {
  leadId: string;
  leadName: string;
  status: LeadStatus;
  type: LeadType;
  source: string;
  email: string;
  draft?: string | null;
};

export function LeadActions({
  leadId,
  leadName,
  status,
  type,
  source,
  email,
  draft,
}: LeadActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [converting, startConvert] = useTransition();
  const [contacting, startContact] = useTransition();
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackEvent("lead.viewed", { leadId, type, source });
  }, [leadId, type, source]);

  const handleMarkReplied = () => {
    startTransition(async () => {
      const result = await markLeadAsRepliedAction(leadId);
      if (!result.success) {
        toast.error(result.message || "Failed to update lead status.");
        return;
      }
      trackEvent("lead.replied", { leadId, type });
      toast.success("Lead marked as replied");
      router.refresh();
    });
  };

  const handleReplyViaEmail = () => {
    startContact(async () => {
      const result = await markLeadContactedAction(leadId);
      if (!result.success) {
        toast.error(result.message || "Failed to mark lead as contacted.");
        return;
      }
      trackEvent("lead.email_reply_initiated", {
        leadId,
        type,
        hasDraft: !!draft,
      });

      // Build mailto link with draft content if available
      const subject = encodeURIComponent("Re: Your inquiry");
      const body = draft ? encodeURIComponent(draft) : "";
      window.location.href = `mailto:${email}?subject=${subject}${
        body ? `&body=${body}` : ""
      }`;
      router.refresh();
    });
  };

  const handleConvert = () => {
    startConvert(async () => {
      try {
        const result = await convertLeadToProjectAction(leadId);
        if (result?.projectId) {
          trackEvent("lead.converted_to_project", { leadId, type });
          toast.success("Project created from lead");
          router.push(`/admin/projects/${result.projectId}`);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to convert lead into project.");
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        onClick={handleReplyViaEmail}
        disabled={contacting}
        className="gap-2"
      >
        <Mail className="h-4 w-4" />
        {contacting
          ? "Opening…"
          : draft
          ? "Reply with draft"
          : "Reply via email"}
      </Button>
      {status !== "replied" ? (
        <Button
          type="button"
          variant="secondary"
          onClick={handleMarkReplied}
          disabled={pending}
        >
          {pending ? "Marking…" : "Mark as replied"}
        </Button>
      ) : null}
      <Button
        type="button"
        variant="outline"
        onClick={handleConvert}
        disabled={converting}
      >
        {converting ? "Creating project…" : "Convert to project"}
      </Button>
      <Button asChild variant="outline">
        <Link
          href={`/admin/meetings/new?leadId=${leadId}&leadName=${encodeURIComponent(
            leadName
          )}`}
          className="gap-2"
        >
          <Calendar className="h-4 w-4" />
          Log meeting
        </Link>
      </Button>
      {draft ? (
        <p className="text-xs text-muted-foreground">
          ✓ AI draft ready (see below to edit)
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Generate draft below, then reply
        </p>
      )}
    </div>
  );
}
