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
import { sendEmail } from "@/lib/resend";

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

export type SendProjectEmailInput = {
  projectId: string;
  to: string;
  subject: string;
  body: string;
  emailType: "kickoff" | "data-request" | "follow-up" | "custom";
};

export type SendProjectEmailResult = {
  success: boolean;
  message?: string;
  emailId?: string;
};

export async function sendProjectEmailAction(
  input: SendProjectEmailInput
): Promise<SendProjectEmailResult> {
  const { projectId, to, subject, body, emailType } = input;

  if (!projectId || !to || !subject || !body) {
    return { success: false, message: "Missing required fields" };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return { success: false, message: "Invalid email address" };
  }

  await requireAdminSession();

  try {
    const project = await assertProjectExists(projectId);

    // Convert plain text to HTML (preserve line breaks)
    const htmlBody = body
      .split("\n")
      .map((line) => `<p>${line || "&nbsp;"}</p>`)
      .join("\n");

    const result = await sendEmail({
      to,
      subject,
      html: htmlBody,
      projectId,
    });

    if (!result.success) {
      return {
        success: false,
        message: result.error || "Failed to send email",
      };
    }

    // Add timeline entry for the sent email
    const emailTypeLabel = {
      kickoff: "Kickoff",
      "data-request": "Data request",
      "follow-up": "Follow-up",
      custom: "Custom",
    }[emailType];

    await addProjectTimelineEntry(
      projectId,
      `📧 ${emailTypeLabel} email sent to ${to}: "${subject}"`
    );

    revalidatePath(`/admin/projects/${projectId}`);

    return { success: true, emailId: result.emailId };
  } catch (error) {
    await reportServerError(error, {
      action: "sendProjectEmail",
      projectId,
      emailType,
    });
    console.error("[Send Project Email Error]", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}
