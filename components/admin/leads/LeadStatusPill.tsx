import type { LeadStatus } from "@/lib/lead-store";

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
  viewed: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
  replied: "bg-slate-200 text-slate-900 dark:bg-slate-500/20 dark:text-slate-100",
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  viewed: "Viewed",
  replied: "Replied",
};

export function LeadStatusPill({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
