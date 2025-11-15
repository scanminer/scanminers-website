"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import type { LeadStatus, LeadType } from "@/lib/lead-store";
import { markLeadAsRepliedAction } from "@/app/admin/leads/actions";

type LeadActionsProps = {
  leadId: string;
  status: LeadStatus;
  type: LeadType;
  source: string;
};

export function LeadActions({ leadId, status, type, source }: LeadActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackEvent("lead.viewed", { leadId, type, source });
  }, [leadId, type, source]);

  if (status === "replied") {
    return null;
  }

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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" onClick={handleMarkReplied} disabled={pending}>
        {pending ? "Marking…" : "Mark as replied"}
      </Button>
    </div>
  );
}
