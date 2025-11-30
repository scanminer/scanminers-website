/**
 * Scanminers Brain v0.1 - Knowledge Extraction
 *
 * Uses GPT-4 to extract structured knowledge from MDX content.
 */

import { createChatCompletion, type ChatMessage } from "@/lib/ai/openai";
import type { KnowledgeItem } from "./types";

const EXTRACTION_SYSTEM_PROMPT = `You are a knowledge extraction assistant for Scanminers, a mineral exploration AI company.

Your task is to analyze technical content about mineral exploration, remote sensing, and geoscience, then extract structured knowledge.

Extract the following fields as JSON:
- summary: A 2-3 sentence executive summary
- problems: Array of key problems/challenges this content addresses
- techniques: Array of remote sensing, AI, or geoscience techniques mentioned
- dataRequirements: Array of data inputs or sources needed
- commodities: Array of minerals/commodities covered (use symbols like Cu, Li, Co, etc.)
- regions: Array of geographic regions mentioned
- risks: Array of risks, limitations, or challenges noted
- outcomes: Array of key outcomes, results, or recommendations
- keywords: Array of 5-10 search keywords

Be precise and technical. Extract actual content, don't invent.
Return ONLY valid JSON, no markdown.`;

type ExtractionResult = {
  summary: string;
  problems: string[];
  techniques: string[];
  dataRequirements: string[];
  commodities: string[];
  regions: string[];
  risks: string[];
  outcomes: string[];
  keywords: string[];
};

/**
 * Extract structured knowledge from MDX content using GPT-4.
 */
export async function extractKnowledge(
  title: string,
  content: string,
  existingMetadata?: {
    commodity?: string | string[];
    region?: string;
    tags?: string[];
  }
): Promise<ExtractionResult> {
  // Truncate content if too long (GPT-4 context limits)
  const maxContentLength = 12000;
  const truncatedContent =
    content.length > maxContentLength
      ? content.slice(0, maxContentLength) + "\n...[truncated]"
      : content;

  const userPrompt = `Analyze this mineral exploration content and extract structured knowledge.

Title: ${title}

${
  existingMetadata
    ? `Existing metadata:
- Commodities: ${
        Array.isArray(existingMetadata.commodity)
          ? existingMetadata.commodity.join(", ")
          : existingMetadata.commodity || "unknown"
      }
- Region: ${existingMetadata.region || "unknown"}
- Tags: ${existingMetadata.tags?.join(", ") || "none"}
`
    : ""
}

Content:
${truncatedContent}

Return the extracted knowledge as JSON.`;

  const messages: ChatMessage[] = [
    { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];

  const response = await createChatCompletion({
    messages,
    model: "gpt-4o",
    temperature: 0.2,
    maxTokens: 1500,
  });

  // Parse the JSON response
  try {
    // Clean up potential markdown code blocks
    let jsonStr = response.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith("```")) {
      jsonStr = jsonStr.slice(0, -3);
    }

    const parsed = JSON.parse(jsonStr.trim()) as Partial<ExtractionResult>;

    return {
      summary: parsed.summary || "",
      problems: Array.isArray(parsed.problems) ? parsed.problems : [],
      techniques: Array.isArray(parsed.techniques) ? parsed.techniques : [],
      dataRequirements: Array.isArray(parsed.dataRequirements)
        ? parsed.dataRequirements
        : [],
      commodities: Array.isArray(parsed.commodities) ? parsed.commodities : [],
      regions: Array.isArray(parsed.regions) ? parsed.regions : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      outcomes: Array.isArray(parsed.outcomes) ? parsed.outcomes : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    };
  } catch (parseError) {
    console.error("Failed to parse extraction response:", response);
    throw new Error(
      `Failed to parse knowledge extraction: ${
        parseError instanceof Error ? parseError.message : "Unknown error"
      }`
    );
  }
}

/**
 * Create a KnowledgeItem from MDX frontmatter and extracted knowledge.
 */
export function createKnowledgeItem(
  slug: string,
  title: string,
  type: "insight" | "case_study",
  extraction: ExtractionResult,
  metadata?: {
    publishedAt?: string;
    sourceUrl?: string;
  }
): KnowledgeItem {
  const now = new Date().toISOString();

  return {
    id: `${type}-${slug}`,
    slug,
    title,
    type,
    sourceUrl: metadata?.sourceUrl || `/insights/${slug}`,
    summary: extraction.summary,
    problems: extraction.problems,
    techniques: extraction.techniques,
    dataRequirements: extraction.dataRequirements,
    commodities: extraction.commodities,
    regions: extraction.regions,
    risks: extraction.risks,
    outcomes: extraction.outcomes,
    keywords: extraction.keywords,
    publishedAt: metadata?.publishedAt,
    createdAt: now,
    updatedAt: now,
  };
}
