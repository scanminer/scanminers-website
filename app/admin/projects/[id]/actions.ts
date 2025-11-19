"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-session";
import {
  addProjectTimelineEntry,
  assertProjectExists,
  type ProjectStatus,
  updateProjectStatus,
} from "@/lib/project-store";
import { reportServerError } from "@/lib/server-logger";

export async function updateProjectStatusAction(
  projectId: string,
  status: ProjectStatus
): Promise<{ error?: string }> {
  if (!projectId) {
    return { error: "Project ID is required" };
  }

  try {
    await requireAdminSession();
  } catch {
    return { error: "Unauthorized" };
  }

  try {
    await assertProjectExists(projectId);
    await updateProjectStatus(projectId, status);
    await addProjectTimelineEntry(projectId, `Status updated to ${status}`);
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${projectId}`);
    return {};
  } catch (error) {
    await reportServerError(error, {
      action: "updateProjectStatus",
      projectId,
      status,
    });
    return {
      error: error instanceof Error ? error.message : "Failed to update status",
    };
  }
}

export async function addProjectTimelineEntryAction(
  projectId: string,
  formData: FormData
) {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const message = formData.get("message");
  if (typeof message !== "string" || !message.trim()) {
    throw new Error("Timeline message is required");
  }

  await requireAdminSession();

  try {
    await assertProjectExists(projectId);
    await addProjectTimelineEntry(projectId, message);
    revalidatePath(`/admin/projects/${projectId}`);
  } catch (error) {
    await reportServerError(error, {
      action: "addProjectTimelineEntry",
      projectId,
    });
    throw error;
  }
}
