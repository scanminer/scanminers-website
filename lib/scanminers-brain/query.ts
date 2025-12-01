/**
 * Scanminers Brain v0.1 - Query Engine
 *
 * Handles similarity search and AI assessment generation.
 */

import { createChatCompletion, type ChatMessage } from "@/lib/ai/openai";
import { createEmbedding, buildQueryText, findSimilar } from "./embeddings";
import { getItemsWithEmbeddings, getStoreStats } from "./store";
import type {
  BrainQuery,
  BrainResponse,
  KnowledgeItem,
  RelatedKnowledgeResult,
} from "./types";

const ASSESSMENT_SYSTEM_PROMPT = `You are Scanminers Brain, an AI assistant that helps exploration teams understand how existing knowledge relates to new opportunities.

Given a lead/project context and related knowledge items from the Scanminers database, provide:
1. A relevance explanation for each knowledge item (1-2 sentences)
2. An overall assessment including:
   - Overall fit (strong/moderate/weak)
   - Summary of how the knowledge relates to the query
   - Suggested data needs for this project
   - Potential risks to flag
   - Recommended next steps

Be specific and technical. Reference actual content from the knowledge items.
Return JSON only.`;

type AssessmentInput = {
  query: BrainQuery;
  results: Array<{ item: KnowledgeItem; score: number }>;
};

type AssessmentOutput = {
  relevanceReasons: Record<string, string>;
  overallFit: "strong" | "moderate" | "weak";
  summary: string;
  suggestedDataNeeds: string[];
  potentialRisks: string[];
  recommendedNextSteps: string[];
};

/**
 * Generate AI assessment for query results.
 */
async function generateAssessment(
  input: AssessmentInput
): Promise<AssessmentOutput> {
  const queryContext = `
Lead/Project Context:
- Title: ${input.query.title}
- Description: ${input.query.description || "Not provided"}
- Commodities: ${input.query.commodities?.join(", ") || "Not specified"}
- Region: ${input.query.region || "Not specified"}
- Additional context: ${input.query.context || "None"}
`.trim();

  const knowledgeContext = input.results
    .map((r, i) =>
      `
Knowledge Item ${i + 1} (score: ${r.score.toFixed(3)}):
- Title: ${r.item.title}
- Summary: ${r.item.summary}
- Commodities: ${r.item.commodities.join(", ") || "N/A"}
- Techniques: ${r.item.techniques.join(", ") || "N/A"}
- Risks: ${r.item.risks.join("; ") || "N/A"}
`.trim()
    )
    .join("\n\n");

  const userPrompt = `Analyze how the following knowledge relates to this lead/project.

${queryContext}

Related Knowledge from Scanminers Database:
${knowledgeContext}

Provide your assessment as JSON with these fields:
- relevanceReasons: object mapping each knowledge item title to a 1-2 sentence relevance explanation
- overallFit: "strong", "moderate", or "weak"
- summary: 2-3 sentence summary of how the knowledge applies
- suggestedDataNeeds: array of specific data requirements for this project
- potentialRisks: array of risks to flag
- recommendedNextSteps: array of 2-4 concrete next steps`;

  const messages: ChatMessage[] = [
    { role: "system", content: ASSESSMENT_SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];

  const response = await createChatCompletion({
    messages,
    model: "gpt-4o",
    temperature: 0.3,
    maxTokens: 1200,
  });

  try {
    let jsonStr = response.trim();
    if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
    if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
    if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);

    const parsed = JSON.parse(jsonStr.trim()) as Partial<AssessmentOutput>;

    return {
      relevanceReasons: parsed.relevanceReasons || {},
      overallFit: parsed.overallFit || "moderate",
      summary: parsed.summary || "Assessment could not be generated.",
      suggestedDataNeeds: Array.isArray(parsed.suggestedDataNeeds)
        ? parsed.suggestedDataNeeds
        : [],
      potentialRisks: Array.isArray(parsed.potentialRisks)
        ? parsed.potentialRisks
        : [],
      recommendedNextSteps: Array.isArray(parsed.recommendedNextSteps)
        ? parsed.recommendedNextSteps
        : [],
    };
  } catch {
    console.error("Failed to parse assessment response:", response);
    return {
      relevanceReasons: {},
      overallFit: "moderate",
      summary:
        "Assessment generation failed. Please review the results manually.",
      suggestedDataNeeds: [],
      potentialRisks: ["Assessment parsing failed"],
      recommendedNextSteps: ["Review knowledge items manually"],
    };
  }
}

/**
 * Query the Scanminers Brain for related knowledge.
 */
export async function queryBrain(query: BrainQuery): Promise<BrainResponse> {
  const startTime = Date.now();

  // Get items with embeddings
  const itemsWithEmbeddings = await getItemsWithEmbeddings();
  const stats = await getStoreStats();

  if (itemsWithEmbeddings.length === 0) {
    return {
      query: {
        title: query.title,
        commodities: query.commodities || [],
        region: query.region || "",
      },
      results: [],
      assessment: {
        overallFit: "weak",
        summary:
          "No knowledge items available. Run the ETL pipeline to populate the knowledge base.",
        suggestedDataNeeds: [],
        potentialRisks: ["Knowledge base is empty"],
        recommendedNextSteps: ["Run the Brain ETL pipeline to index insights"],
      },
      metadata: {
        totalKnowledgeItems: stats.itemCount,
        queryEmbeddingModel: "text-embedding-3-small",
        processingTimeMs: Date.now() - startTime,
      },
    };
  }

  // Build query text and embed it
  const queryText = buildQueryText(query);
  const queryEmbedding = await createEmbedding(queryText);

  // Transform items to the format expected by findSimilar
  const embeddableItems = itemsWithEmbeddings
    .filter((i) => i.embedding?.vector)
    .map((i) => ({
      ...i.item,
      vector: i.embedding!.vector,
    }));

  // Find similar items
  const similar = findSimilar(
    queryEmbedding.vector,
    embeddableItems,
    query.limit || 5
  );

  // Filter out low-scoring results (below 0.3 threshold)
  const relevantResults = similar.filter((r) => r.score > 0.3);

  // Generate AI assessment
  const assessment = await generateAssessment({
    query,
    results: relevantResults.map((r) => ({
      item: r,
      score: r.score,
    })),
  });

  // Build response
  const results: RelatedKnowledgeResult[] = relevantResults.map((r) => {
    // Remove the vector from the result - destructure it out
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { vector: _, ...itemWithoutVector } = r;
    return {
      item: itemWithoutVector,
      score: r.score,
      relevanceReason:
        assessment.relevanceReasons[r.title] ||
        `Similarity score: ${(r.score * 100).toFixed(1)}%`,
    };
  });

  return {
    query: {
      title: query.title,
      commodities: query.commodities || [],
      region: query.region || "",
    },
    results,
    assessment: {
      overallFit: assessment.overallFit,
      summary: assessment.summary,
      suggestedDataNeeds: assessment.suggestedDataNeeds,
      potentialRisks: assessment.potentialRisks,
      recommendedNextSteps: assessment.recommendedNextSteps,
    },
    metadata: {
      totalKnowledgeItems: stats.itemCount,
      queryEmbeddingModel: "text-embedding-3-small",
      processingTimeMs: Date.now() - startTime,
    },
  };
}
