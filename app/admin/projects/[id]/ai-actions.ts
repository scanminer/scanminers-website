"use server";

import { revalidatePath } from "next/cache";
import {
  getProjectById,
  listProjectTimelineEntries,
  saveProjectAISummary,
} from "@/lib/project-store";
import { getLead } from "@/lib/lead-store";
import {
  generateProjectSummary,
  generateKickoffEmail,
  generateDataRequestEmail,
} from "@/lib/ai/ai-insights";
import { requireAdminSession } from "@/lib/admin-session";
import { reportServerError } from "@/lib/server-logger";

export async function generateProjectSummaryAction(projectId: string) {
  if (!projectId) {
    return { success: false, message: "Missing project ID." };
  }

  await requireAdminSession();

  try {
    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        message:
          "OpenAI API key not configured. Please set OPENAI_API_KEY in .env.local",
      };
    }

    const project = await getProjectById(projectId);
    if (!project) {
      return { success: false, message: "Project not found." };
    }

    const timeline = await listProjectTimelineEntries(projectId);
    const lead = project.leadId ? await getLead(project.leadId) : null;

    // Convert timeline to format expected by AI function
    const timelineFormatted = timeline.map((entry) => ({
      action: "note",
      actor: "system",
      detail: entry.message,
      createdAt: entry.createdAt,
    }));

    const summary = await generateProjectSummary(
      project,
      timelineFormatted,
      lead
    );

    // Save summary to database
    await saveProjectAISummary(projectId, summary);

    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${projectId}`);

    return {
      success: true,
      summary,
    };
  } catch (error) {
    await reportServerError(error, {
      action: "generateProjectSummary",
      projectId,
    });
    console.error("[Project Summary Error]", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate project summary.";
    return { success: false, message };
  }
}

export async function generateKickoffEmailAction(projectId: string) {
  if (!projectId) {
    return { success: false, message: "Missing project ID." };
  }

  await requireAdminSession();

  try {
    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        message:
          "OpenAI API key not configured. Please set OPENAI_API_KEY in .env.local",
      };
    }

    const project = await getProjectById(projectId);
    if (!project) {
      return { success: false, message: "Project not found." };
    }

    const lead = project.leadId ? await getLead(project.leadId) : null;

    const clientInfo = {
      name: lead?.name || project.clientName,
      email: lead?.email || "client@example.com",
      company: lead?.company || null,
    };

    const emailDraft = await generateKickoffEmail(project, clientInfo);

    revalidatePath(`/admin/projects/${projectId}`);

    return {
      success: true,
      emailDraft,
      clientEmail: clientInfo.email,
    };
  } catch (error) {
    await reportServerError(error, {
      action: "generateKickoffEmail",
      projectId,
    });
    console.error("[Kickoff Email Error]", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate kickoff email.";
    return { success: false, message };
  }
}

export async function generateDataRequestEmailAction(projectId: string) {
  if (!projectId) {
    return { success: false, message: "Missing project ID." };
  }

  await requireAdminSession();

  try {
    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        message:
          "OpenAI API key not configured. Please set OPENAI_API_KEY in .env.local",
      };
    }

    const project = await getProjectById(projectId);
    if (!project) {
      return { success: false, message: "Project not found." };
    }

    const lead = project.leadId ? await getLead(project.leadId) : null;

    const emailDraft = await generateDataRequestEmail(project, lead);

    revalidatePath(`/admin/projects/${projectId}`);

    return {
      success: true,
      emailDraft,
      clientEmail: lead?.email || "client@example.com",
    };
  } catch (error) {
    await reportServerError(error, {
      action: "generateDataRequestEmail",
      projectId,
    });
    console.error("[Data Request Email Error]", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate data request email.";
    return { success: false, message };
  }
}
