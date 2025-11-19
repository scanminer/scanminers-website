"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { ProjectStatus } from "@/lib/project-store";

interface ProjectStatusButtonsProps {
  projectId: string;
  currentStatus: ProjectStatus;
  updateStatusAction: (
    projectId: string,
    status: ProjectStatus
  ) => Promise<{ error?: string }>;
}

export function ProjectStatusButtons({
  projectId,
  currentStatus,
  updateStatusAction,
}: ProjectStatusButtonsProps) {
  const [activeState, activeAction, activeIsPending] = useActionState(
    async () => {
      const result = await updateStatusAction(projectId, "active");
      return result?.error ? { error: result.error } : { success: true };
    },
    { success: false }
  );

  const [completedState, completedAction, completedIsPending] = useActionState(
    async () => {
      const result = await updateStatusAction(projectId, "completed");
      return result?.error ? { error: result.error } : { success: true };
    },
    { success: false }
  );

  return (
    <div className="flex flex-wrap gap-2">
      <form action={activeAction}>
        <Button
          type="submit"
          disabled={
            currentStatus === "active" ||
            currentStatus === "completed" ||
            activeIsPending
          }
        >
          {activeIsPending ? "Updating..." : "Mark active"}
        </Button>
        {activeState.error && (
          <p className="text-sm text-destructive mt-1">{activeState.error}</p>
        )}
      </form>
      <form action={completedAction}>
        <Button
          type="submit"
          variant="secondary"
          disabled={currentStatus === "completed" || completedIsPending}
        >
          {completedIsPending ? "Updating..." : "Mark completed"}
        </Button>
        {completedState.error && (
          <p className="text-sm text-destructive mt-1">
            {completedState.error}
          </p>
        )}
      </form>
    </div>
  );
}
