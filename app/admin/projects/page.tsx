import Link from "next/link";
import { listProjects, type ProjectStatus } from "@/lib/project-store";
import { ProjectStatusBadge } from "@/components/admin/projects/ProjectStatusBadge";

export const revalidate = 0;

const STATUS_OPTIONS: Array<{ value: ProjectStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

type SearchParams = { [key: string]: string | string[] | undefined };

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseStatusParam(value: string | undefined): ProjectStatus | "all" {
  if (value === "new" || value === "active" || value === "completed")
    return value;
  return "all";
}

function buildQuery(status: ProjectStatus | "all") {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  const query = params.toString();
  return query ? `?${query}` : "";
}

function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default async function AdminProjectsPage(props: {
  searchParams?: Promise<SearchParams>;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const statusFilter = parseStatusParam(getParamValue(searchParams.status));
  const allProjects = await listProjects({ status: "all", limit: 200 });
  const projects =
    statusFilter === "all"
      ? allProjects
      : allProjects.filter((project) => project.status === statusFilter);

  const stats = {
    total: allProjects.length,
    active: allProjects.filter((project) => project.status === "active").length,
    completed: allProjects.filter((project) => project.status === "completed")
      .length,
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Convert qualified leads into delivery projects and follow every
          milestone from kickoff to completion.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Total" value={stats.total} helper="All projects" />
        <SummaryCard
          label="Active"
          value={stats.active}
          helper="Currently in progress"
        />
        <SummaryCard
          label="Completed"
          value={stats.completed}
          helper="Delivered engagements"
        />
      </section>

      <section className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map((option) => (
            <FilterChip
              key={option.value}
              href={`/admin/projects${buildQuery(option.value)}`}
              active={statusFilter === option.value}
              label={option.label}
            />
          ))}
        </div>

        <div className="mt-4 divide-y rounded-xl border bg-background">
          {projects.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No projects match this filter yet.
            </p>
          ) : (
            projects.map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className="flex flex-col gap-3 p-4 transition hover:bg-muted/60 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold leading-tight">
                    {project.projectName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Client · {project.clientName}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-3 text-sm sm:items-end">
                  <ProjectStatusBadge status={project.status} />
                  <p className="text-xs text-muted-foreground">
                    Created {formatDateTime(project.createdAt)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? "bg-foreground text-background"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
    >
      {label}
    </Link>
  );
}
