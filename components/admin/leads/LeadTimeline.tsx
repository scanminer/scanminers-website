import type { LeadEvent } from "@/lib/lead-store";
import { formatDate } from "@/lib/date";

function formatTimestamp(ts: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(ts));
  } catch {
    return formatDate(ts);
  }
}

export function LeadTimeline({ events }: { events: LeadEvent[] }) {
  if (!events.length) {
    return <p className="text-sm text-muted-foreground">No timeline entries yet.</p>;
  }

  return (
    <ol className="space-y-4">
      {events.map((event) => (
        <li key={event.id} className="relative pl-5">
          <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-foreground" aria-hidden />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium capitalize">
              {event.action.replace("-", " ")} <span className="text-xs font-normal text-muted-foreground">by {event.actor}</span>
            </p>
            <p className="text-xs text-muted-foreground">{formatTimestamp(event.createdAt)}</p>
            {event.detail ? (
              <pre className="whitespace-pre-wrap rounded-md bg-muted/60 p-3 text-sm text-muted-foreground">
                {event.detail}
              </pre>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
