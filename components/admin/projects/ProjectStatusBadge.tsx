import type { ProjectStatus } from "@/lib/project-store";

const STATUS_STYLES: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  new: {
    label: "New",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-200",
  },
  active: {
    label: "Active",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200",
  },
  completed: {
    label: "Completed",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200",
  },
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const variant = STATUS_STYLES[status] ?? STATUS_STYLES.new;
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${variant.className}`}
    >
      {variant.label}
    </span>
  );
}
