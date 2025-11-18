"use server";

import { revalidatePath } from "next/cache";
import { getLead } from "@/lib/lead-store";
import {
  addProjectTimelineEntry,
  createProjectFromLead,
} from "@/lib/project-store";
import { requireAdminSession } from "@/lib/admin-session";
import { reportServerError } from "@/lib/server-logger";

export async function convertLeadToProjectAction(
  leadId: string
): Promise<{ projectId: string }> {
  if (!leadId) {
    throw new Error("Lead ID is required.");
  }

  await requireAdminSession();

  try {
    const lead = await getLead(leadId);
    if (!lead) {
      throw new Error("Lead not found.");
    }

    const project = await createProjectFromLead(lead);
    await addProjectTimelineEntry(
      project.id,
      "Project created from lead conversion"
    );

    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${project.id}`);

    return { projectId: project.id };
  } catch (error) {
    await reportServerError(error, { action: "convertLeadToProject", leadId });
    throw error;
  }
}
