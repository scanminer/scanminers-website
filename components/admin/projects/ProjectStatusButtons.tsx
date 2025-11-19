"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();

  const [activeState, activeAction, activeIsPending] = useActionState(
    async () => {
      try {
        const result = await updateStatusAction(projectId, "active");
        if (result?.error) {
          return { error: result.error };
        }
        return { success: true };
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Failed to update status",
        };
      }
    },
    { success: false }
  );

  const [completedState, completedAction, completedIsPending] = useActionState(
    async () => {
      try {
        const result = await updateStatusAction(projectId, "completed");
        if (result?.error) {
          return { error: result.error };
        }
        return { success: true };
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Failed to update status",
        };
      }
    },
    { success: false }
  );

  useEffect(() => {
    if (activeState.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: activeState.error,
      });
    } else if (activeState.success) {
      toast({
        title: "Success",
        description: "Project marked as active",
      });
    }
  }, [activeState, toast]);

  useEffect(() => {
    if (completedState.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: completedState.error,
      });
    } else if (completedState.success) {
      toast({
        title: "Success",
        description: "Project marked as completed",
      });
    }
  }, [completedState, toast]);

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
      </form>
      <form action={completedAction}>
        <Button
          type="submit"
          variant="secondary"
          disabled={currentStatus === "completed" || completedIsPending}
        >
          {completedIsPending ? "Updating..." : "Mark completed"}
        </Button>
      </form>
    </div>
  );
}
