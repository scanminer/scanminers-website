"use server";

import { revalidatePath } from "next/cache";
import { getLead, saveLeadAIInsight } from "@/lib/lead-store";
import { generateLeadSummaryAndTags } from "@/lib/ai/ai-insights";
import { requireAdminSession } from "@/lib/admin-session";
import { reportServerError } from "@/lib/server-logger";

export async function generateLeadInsightAction(leadId: string) {
  if (!leadId) {
    return { success: false, message: "Missing lead ID." };
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

    const lead = await getLead(leadId);
    if (!lead) {
      return { success: false, message: "Lead not found." };
    }

    // Generate AI insight
    const insight = await generateLeadSummaryAndTags(lead);

    // Save to database
    await saveLeadAIInsight(leadId, insight);

    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${leadId}`);

    return {
      success: true,
      insight,
    };
  } catch (error) {
    await reportServerError(error, { action: "generateLeadInsight", leadId });
    console.error("[AI Insight Error]", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate lead insight.";
    return { success: false, message };
  }
}
