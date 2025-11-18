import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ProjectStatusBadge } from "@/components/admin/projects/ProjectStatusBadge";
import {
  getProjectById,
  listProjectTimelineEntries,
} from "@/lib/project-store";
import {
  addProjectTimelineEntryAction,
  updateProjectStatusAction,
} from "./actions";
import { ProjectAiPanel } from "@/components/admin/projects/ProjectAiPanel";

export const revalidate = 0;

export default async function ProjectDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const project = await getProjectById(params.id);
  if (!project) {
    notFound();
  }

  const timeline = await listProjectTimelineEntries(project.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b pb-4">
        <Link
          href="/admin/projects"
          className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          ← Back to projects
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <ProjectStatusBadge status={project.status} />
          <span className="text-xs text-muted-foreground">
            Created {formatDateTime(project.createdAt)}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-semibold leading-snug">
            {project.projectName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Client · {project.clientName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form
            action={updateProjectStatusAction.bind(null, project.id, "active")}
          >
            <Button
              type="submit"
              disabled={
                project.status === "active" || project.status === "completed"
              }
            >
              Mark active
            </Button>
          </form>
          <form
            action={updateProjectStatusAction.bind(
              null,
              project.id,
              "completed"
            )}
          >
            <Button
              type="submit"
              variant="secondary"
              disabled={project.status === "completed"}
            >
              Mark completed
            </Button>
          </form>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Timeline</h2>
            <span className="text-xs text-muted-foreground">
              {timeline.length} update{timeline.length === 1 ? "" : "s"}
            </span>
          </div>
          {timeline.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No updates yet. Use the panel to log progress.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {timeline.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-lg border bg-background p-3"
                >
                  <p className="text-sm font-medium text-foreground">
                    {entry.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(entry.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold">Add timeline update</h2>
            <form
              action={addProjectTimelineEntryAction.bind(null, project.id)}
              className="mt-3 space-y-3"
            >
              <Textarea
                name="message"
                required
                minLength={3}
                placeholder="Document milestones, blockers, or handoffs..."
                rows={6}
              />
              <Button type="submit">Add update</Button>
            </form>
          </div>
          <ProjectAiPanel
            projectId={project.id}
            initialSummary={project.aiProjectSummary}
            clientEmail={undefined}
          />
        </div>
      </section>
    </div>
  );
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
