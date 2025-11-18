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
) {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  await requireAdminSession();

  try {
    await assertProjectExists(projectId);
    await updateProjectStatus(projectId, status);
    await addProjectTimelineEntry(projectId, `Status updated to ${status}`);
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${projectId}`);
  } catch (error) {
    await reportServerError(error, {
      action: "updateProjectStatus",
      projectId,
      status,
    });
    throw error;
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
