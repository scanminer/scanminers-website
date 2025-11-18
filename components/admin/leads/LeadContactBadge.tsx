import type { LeadContactStatus } from "@/lib/lead-store";

type LeadContactBadgeProps = {
  status: LeadContactStatus;
};

const CONTACT_CONFIG: Record<
  LeadContactStatus,
  { label: string; className: string }
> = {
  not_contacted: {
    label: "Not contacted",
    className: "bg-muted text-muted-foreground",
  },
  contacted: {
    label: "Contacted",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
};

export function LeadContactBadge({ status }: LeadContactBadgeProps) {
  const config = CONTACT_CONFIG[status];
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
