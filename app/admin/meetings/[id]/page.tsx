import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { getMeetingWithActions, type MeetingType } from "@/lib/meeting-store";
import { MeetingOverviewCard } from "@/components/admin/meetings/MeetingOverviewCard";
import { MeetingNotesCard } from "@/components/admin/meetings/MeetingNotesCard";
import { MeetingActionsCard } from "@/components/admin/meetings/MeetingActionsCard";
import { MeetingContextCard } from "@/components/admin/meetings/MeetingContextCard";

export const revalidate = 0;

function getTypeStyles(type: MeetingType) {
  switch (type) {
    case "internal":
      return "bg-slate-700/60 text-slate-200 border-slate-600";
    case "prospect":
      return "bg-cyan-950/60 text-cyan-300 border-cyan-800";
    case "client":
      return "bg-emerald-950/60 text-emerald-300 border-emerald-800";
    default:
      return "bg-slate-800 text-slate-300";
  }
}

function formatHeaderDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default async function MeetingDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const meeting = await getMeetingWithActions(params.id);

  if (!meeting) {
    notFound();
  }

  const openActionsCount = meeting.actions.filter(
    (a) => a.status !== "done"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border/50 pb-4">
        <Link
          href="/admin/meetings"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to meetings
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="capitalize">{meeting.type}</span>
          <span className="text-muted-foreground/50">·</span>
          <span>{formatHeaderDate(meeting.dateTime)}</span>
          {openActionsCount > 0 && (
            <>
              <span className="text-muted-foreground/50">·</span>
              <span className="inline-flex items-center gap-1 text-amber-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {openActionsCount} open action
                {openActionsCount !== 1 ? "s" : ""}
              </span>
            </>
          )}
        </div>

        <h1 className="text-2xl font-semibold leading-snug">{meeting.title}</h1>
      </div>

      {/* 2-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Left Column: The Story */}
        <div className="space-y-6">
          <MeetingOverviewCard
            meetingId={meeting.id}
            title={meeting.title}
            dateTime={meeting.dateTime}
            type={meeting.type}
            participants={meeting.participants}
          />

          <MeetingNotesCard
            meetingId={meeting.id}
            notes={meeting.notes}
            decisions={meeting.decisions}
          />
        </div>

        {/* Right Column: Actions & Context */}
        <div className="space-y-6">
          <MeetingActionsCard
            meetingId={meeting.id}
            actions={meeting.actions}
          />

          <MeetingContextCard
            meetingId={meeting.id}
            relatedLeadId={meeting.relatedLeadId}
            relatedProjectId={meeting.relatedProjectId}
            leadName={meeting.leadName}
            projectName={meeting.projectName}
          />
        </div>
      </div>
    </div>
  );
}
