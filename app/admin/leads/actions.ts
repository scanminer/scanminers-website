"use server";

import { revalidatePath } from "next/cache";
import { getLead, markLeadReplied, saveLeadDraft } from "@/lib/lead-store";
import { getAdminActorName } from "@/lib/admin-actor";
import { reportServerError } from "@/lib/server-logger";
import { generateLeadReplyDraft } from "@/lib/ai/lead-replies";

export async function markLeadAsRepliedAction(leadId: string, detail?: string | null) {
  if (!leadId) {
    return { success: false, message: "Missing lead ID." };
  }

  try {
    await markLeadReplied(leadId, detail ?? null, getAdminActorName());
    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${leadId}`);
    return { success: true };
  } catch (error) {
    await reportServerError(error, { action: "markLeadAsReplied", leadId });
    return { success: false, message: "Failed to update lead status." };
  }
}

export async function generateLeadReplyAction(leadId: string) {
  if (!leadId) {
    return { success: false, message: "Missing lead ID." };
  }

  try {
    const lead = await getLead(leadId);
    if (!lead) {
      return { success: false, message: "Lead not found." };
    }

    const draft = await generateLeadReplyDraft(lead);
  await saveLeadDraft(leadId, draft, getAdminActorName());
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
    return { success: true, draft };
  } catch (error) {
    await reportServerError(error, { action: "generateLeadReply", leadId });
    return { success: false, message: "Failed to generate reply." };
  }
}
