import type { LeadRecord } from "@/lib/lead-store";
import { createChatCompletion, type ChatMessage } from "@/lib/ai/openai";
import { buildBrandSystemPrompt } from "@/lib/ai-brand";

const BASE_SYSTEM_PROMPT = [
  "You are a senior consultant at Scanminers replying to inbound leads about GeoAI prospectivity work.",
  "Voice: concise, confident, technical B2B. No slang, no emojis, no exclamation marks.",
  "Never invent bank details, prices, or guarantees. Refer to payment instructions only in generic terms.",
  "Structure replies as short paragraphs (2-4 sentences each) plus optional concise bullet requests.",
  "Always reference the lead's details directly and close with the next concrete action.",
].join(" \n");

const PROSPECTIVITY_BRIEF_GUIDANCE = [
  "They requested a prospectivity brief. Reinforce that it is a high-level, non-binding assessment.",
  "Restate the region(s), commodities, exploration stage, and stated goal/context.",
  "Describe how Scanminers will review available data, discuss relevant multi-sensor + explainable AI workflows, and evaluate fit.",
  "Ask for any missing essentials such as coordinates/licence IDs, existing data holdings, or timelines.",
  "Set a soft expectation that the team typically responds within a few business days.",
].join(" \n");

const CONSULTATION_GUIDANCE = [
  "They requested a paid 60-minute consultation.",
  "Confirm you will send formal payment instructions separately and never quote bank details or prices in this reply.",
  "Reference their AOI, commodities, stage, and goals, emphasizing the strategic value of the session.",
  "Explain that once payment/proof is received, Scanminers proposes times and shares a calendar invite.",
  "Invite any extra detail that would help tailor the discussion (licence IDs, data formats, key decisions/timeline).",
].join(" \n");

const CONTACT_GUIDANCE = [
  "This is a general contact inquiry. Acknowledge their message and steer them toward either a prospectivity brief or consultation as appropriate.",
  "Share 1-2 relevant next steps tailored to their context.",
].join(" \n");

function formatList(values?: string[] | null): string {
  if (!values || values.length === 0) return "";
  return values.join(", ");
}

function describeCommodities(lead: LeadRecord): string {
  if (lead.commodities?.length) return lead.commodities.join(", ");
  const metadata = lead.metadata || {};
  const metaList = Array.isArray(metadata.commodities) ? metadata.commodities : [];
  if (metaList.length) return metaList.join(", ");
  if (typeof metadata.sourceCommodity === "string" && metadata.sourceCommodity.trim()) {
    return metadata.sourceCommodity;
  }
  return "—";
}

function leadSummary(lead: LeadRecord): string {
  const metadata = lead.metadata || {};
  const sections = [
    `Name: ${lead.name}`,
    `Company: ${lead.company || "—"}`,
    `Role: ${lead.role || "—"}`,
    `Email: ${lead.email}`,
    `Type: ${lead.type}`,
    `Source: ${lead.source}`,
    `Region(s): ${lead.region || lead.regions || metadata.regions || "—"}`,
    `Stage: ${lead.stage || metadata.stage || "—"}`,
    `Goal: ${lead.goal || "—"}`,
    `Message: ${lead.message || "—"}`,
    `Additional context: ${lead.additionalContext || lead.context || metadata.additionalContext || metadata.context || "—"}`,
    `Timing: ${lead.timing || "—"}`,
  `Commodities: ${describeCommodities(lead)}`,
  `Data sources: ${formatList(Array.isArray(metadata.dataSources) ? metadata.dataSources : undefined) || "—"}`,
    `Reference: ${lead.reference || metadata.reference || "—"}`,
    `Consent/expectation flags: ${metadata.expectation ? "Expectation acknowledged" : metadata.consent ? "Consent confirmed" : "—"}`,
  ];

  return sections.join("\n");
}

function typeGuidance(lead: LeadRecord): string {
  if (lead.type === "prospectivity_brief") return PROSPECTIVITY_BRIEF_GUIDANCE;
  if (lead.type === "consultation") return CONSULTATION_GUIDANCE;
  return CONTACT_GUIDANCE;
}

function determineAudience(role?: string | null): string | undefined {
  if (!role) return undefined;
  const value = role.toLowerCase();
  if (value.includes("geo") || value.includes("exploration") || value.includes("geologist")) return "geoscience";
  if (value.includes("operation") || value.includes("ops")) return "operations";
  if (value.includes("market")) return "marketing";
  if (value.includes("sales") || value.includes("business development") || value.includes("bd")) return "sales";
  return "executive";
}

function brandMessage(lead: LeadRecord): string {
  return buildBrandSystemPrompt({
    medium: "email",
    audience: determineAudience(lead.role) || "executive",
    mineral: describeCommodities(lead),
    geography: (lead.region || lead.regions || lead.metadata?.regions || "").toString(),
    desiredOutcome: lead.goal || lead.additionalContext || lead.message || undefined,
  });
}

export async function generateLeadReplyDraft(lead: LeadRecord): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: BASE_SYSTEM_PROMPT },
    { role: "system", content: brandMessage(lead) },
    { role: "system", content: typeGuidance(lead) },
    {
      role: "user",
      content: [
        "Write a ready-to-send email reply (plain text).",
        "Limit to ~180-220 words.",
        "Lead details:",
        leadSummary(lead),
      ].join("\n\n"),
    },
  ];

  return createChatCompletion({ messages, maxTokens: 900, temperature: 0.35 });
}
