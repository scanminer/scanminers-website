import type { LeadRecord } from "@/lib/lead-store";
import type { ProjectRecord } from "@/lib/project-store";
import { createChatCompletion, type ChatMessage } from "@/lib/ai/openai";
import { buildBrandSystemPrompt } from "@/lib/ai-brand";

// ============================================================================
// Lead AI Classification & Summary
// ============================================================================

export type LeadAIInsight = {
  summary: string;
  tags: string[];
  valueTier: "high" | "medium" | "low";
  urgency: "high" | "medium" | "low";
  fitScore: number; // 0-100
  confidence: number; // 0-1
};

const LEAD_CLASSIFICATION_SYSTEM_PROMPT = `You are an AI assistant for Scanminers, a GeoAI prospectivity and remote sensing company.

Your job is to analyze incoming leads and provide:
1. A concise 4-6 sentence summary covering:
   - Who they are (name, company, role)
   - What they want (service type, commodities, region)
   - Their context (stage, timeline, constraints)
   - Level of urgency
   - Fit with Scanminers' offerings
   - Suggested next action

2. Classification tags from these categories:

**Service Type Tags:**
- "Prospectivity Brief"
- "LiDAR Project"
- "Multispectral Analysis"
- "Tailings Dam Monitoring"
- "Geophysical Interpretation"
- "AI Advisory"
- "General Inquiry"

**Value Tier:** high | medium | low
(Based on project scope, budget indicators, company size, strategic fit)

**Urgency:** high | medium | low
(Based on timing, deadlines mentioned, language tone)

**Fit Score:** 0-100
(How well this aligns with Scanminers' core services and expertise)

**Confidence:** 0.0-1.0
(Your confidence in the classification)

Return JSON only:
{
  "summary": "...",
  "tags": ["...", "..."],
  "valueTier": "high|medium|low",
  "urgency": "high|medium|low",
  "fitScore": 0-100,
  "confidence": 0.0-1.0
}

Be precise, professional, and realistic. Don't oversell fit or value.`;

function formatLeadForAI(lead: LeadRecord): string {
  const metadata = lead.metadata || {};
  return [
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Company: ${lead.company || "—"}`,
    `Role: ${lead.role || "—"}`,
    `Type: ${lead.type}`,
    `Source: ${lead.source}`,
    `Region: ${lead.region || lead.regions || metadata.regions || "—"}`,
    `Stage: ${lead.stage || metadata.stage || "—"}`,
    `Timing: ${lead.timing || "—"}`,
    `Goal: ${lead.goal || "—"}`,
    `Message: ${lead.message || "—"}`,
    `Additional Context: ${
      lead.additionalContext ||
      lead.context ||
      metadata.additionalContext ||
      "—"
    }`,
    `Commodities: ${formatCommodities(lead)}`,
    `Data Sources: ${
      formatArray(metadata.dataSources as string[] | undefined) || "—"
    }`,
    `Reference: ${lead.reference || metadata.reference || "—"}`,
  ].join("\n");
}

function formatCommodities(lead: LeadRecord): string {
  if (lead.commodities?.length) return lead.commodities.join(", ");
  const metadata = lead.metadata || {};
  const metaList = Array.isArray(metadata.commodities)
    ? metadata.commodities
    : [];
  if (metaList.length) return metaList.join(", ");
  if (
    typeof metadata.sourceCommodity === "string" &&
    metadata.sourceCommodity.trim()
  ) {
    return metadata.sourceCommodity;
  }
  return "—";
}

function formatArray(arr?: string[]): string {
  return arr && arr.length > 0 ? arr.join(", ") : "";
}

export async function generateLeadSummaryAndTags(
  lead: LeadRecord
): Promise<LeadAIInsight> {
  const messages: ChatMessage[] = [
    { role: "system", content: LEAD_CLASSIFICATION_SYSTEM_PROMPT },
    {
      role: "user",
      content: `Analyze this lead and provide classification:\n\n${formatLeadForAI(
        lead
      )}`,
    },
  ];

  const response = await createChatCompletion({
    messages,
    temperature: 0.3,
    maxTokens: 800,
  });

  // Parse JSON response
  const cleaned = response
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  const parsed = JSON.parse(cleaned) as LeadAIInsight;

  // Validate and clamp values
  return {
    summary: parsed.summary || "",
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    valueTier: ["high", "medium", "low"].includes(parsed.valueTier)
      ? parsed.valueTier
      : "medium",
    urgency: ["high", "medium", "low"].includes(parsed.urgency)
      ? parsed.urgency
      : "medium",
    fitScore: Math.max(0, Math.min(100, parsed.fitScore || 50)),
    confidence: Math.max(0, Math.min(1, parsed.confidence || 0.7)),
  };
}

// ============================================================================
// Project AI Assistance
// ============================================================================

export async function generateProjectSummary(
  project: ProjectRecord,
  timeline: Array<{
    action: string;
    actor: string;
    detail?: string | null;
    createdAt: string;
  }>,
  lead?: LeadRecord | null
): Promise<string> {
  const brandContext = lead
    ? buildBrandSystemPrompt({
        medium: "email",
        audience: "executive",
        mineral: formatCommodities(lead),
        geography: (lead.region || lead.regions || "").toString(),
      })
    : "";

  const timelineText = timeline
    .slice(0, 10)
    .map((e) => `- ${e.action} by ${e.actor}: ${e.detail || "—"}`)
    .join("\n");

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are an AI assistant for Scanminers. Generate a concise 5-8 sentence project summary for internal use.

Include:
- Project name and client
- Service type and objectives
- Key timeline milestones
- Current status
- Next steps or blockers

Be factual and professional.`,
    },
    brandContext ? { role: "system", content: brandContext } : null,
    {
      role: "user",
      content: [
        `Project: ${project.projectName}`,
        `Client: ${project.clientName}`,
        `Status: ${project.status}`,
        lead ? `\nOriginal lead context:\n${formatLeadForAI(lead)}` : "",
        `\nRecent timeline:\n${timelineText || "No entries yet"}`,
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ].filter((m): m is ChatMessage => m !== null);

  return createChatCompletion({
    messages,
    temperature: 0.4,
    maxTokens: 600,
  });
}

export async function generateKickoffEmail(
  project: ProjectRecord,
  clientInfo: { name: string; email: string; company?: string | null }
): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are Mahmood Asadi, Co-Founder & Chief AI & Product Architect at Scanminers.

Generate a professional project kickoff email to the client. Include:
- Welcome and thank them for choosing Scanminers
- Brief project overview and objectives
- Timeline expectations
- Next steps and deliverables
- Point of contact for questions
- Signature: Mahmood Asadi, Co-Founder & Chief AI & Product Architect, Scanminers

Tone: warm, confident, technical but accessible. Keep it concise (~200-250 words).`,
    },
    {
      role: "user",
      content: [
        `Client: ${clientInfo.name}`,
        `Email: ${clientInfo.email}`,
        clientInfo.company ? `Company: ${clientInfo.company}` : "",
        `Project: ${project.projectName}`,
        `Status: ${project.status}`,
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];

  return createChatCompletion({
    messages,
    temperature: 0.35,
    maxTokens: 900,
  });
}

export async function generateDataRequestEmail(
  project: ProjectRecord,
  lead?: LeadRecord | null
): Promise<string> {
  const commodities = lead ? formatCommodities(lead) : "—";
  const region = lead ? (lead.region || lead.regions || "").toString() : "—";

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are Mahmood Asadi, Co-Founder & Chief AI & Product Architect at Scanminers.

Generate a data request email for a new project. Include:
- Brief context about the project
- Checklist of needed data:
  • AOI coordinates (WGS84 or local CRS)
  • Geological maps or survey data
  • DEM/LiDAR (if available)
  • Existing satellite imagery or specifications
  • Historical drilling or geochemistry reports
  • Preferred output formats
- Timeline for data submission
- Assurance that Scanminers will handle data securely
- Signature: Mahmood Asadi, Co-Founder & Chief AI & Product Architect, Scanminers

Tone: professional, organized, clear. Include a bulleted checklist for easy copy-paste.
Length: ~250-300 words.`,
    },
    {
      role: "user",
      content: [
        `Project: ${project.projectName}`,
        `Client: ${project.clientName}`,
        `Region: ${region}`,
        `Commodities: ${commodities}`,
        lead ? `\nOriginal lead goal: ${lead.goal || "—"}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];

  return createChatCompletion({
    messages,
    temperature: 0.35,
    maxTokens: 1000,
  });
}
