/**
 * Scanminers Brain v0.1 - Embeddings Helper
 *
 * OpenAI text-embedding-3-small wrapper for generating and comparing embeddings.
 */

const EMBEDDING_API_URL = "https://api.openai.com/v1/embeddings";
const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

function getOpenAiKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("Missing OPENAI_API_KEY");
  }
  return key;
}

export type EmbeddingResult = {
  vector: number[];
  model: string;
  tokensUsed: number;
};

/**
 * Generate an embedding vector for the given text.
 */
export async function createEmbedding(text: string): Promise<EmbeddingResult> {
  if (!text.trim()) {
    throw new Error("Cannot embed empty text");
  }

  const response = await fetch(EMBEDDING_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getOpenAiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`OpenAI embedding error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as {
    data?: Array<{ embedding?: number[] }>;
    usage?: { total_tokens?: number };
  };

  const vector = data.data?.[0]?.embedding;
  if (!vector || !Array.isArray(vector)) {
    throw new Error("OpenAI returned invalid embedding response");
  }

  return {
    vector,
    model: EMBEDDING_MODEL,
    tokensUsed: data.usage?.total_tokens ?? 0,
  };
}

/**
 * Generate embeddings for multiple texts in a single API call.
 */
export async function createEmbeddings(
  texts: string[]
): Promise<EmbeddingResult[]> {
  if (texts.length === 0) return [];
  if (texts.length === 1) return [await createEmbedding(texts[0])];

  const cleanedTexts = texts.map((t) => t.trim()).filter(Boolean);
  if (cleanedTexts.length === 0) {
    throw new Error("No valid texts to embed");
  }

  const response = await fetch(EMBEDDING_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getOpenAiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: cleanedTexts,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`OpenAI embedding error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as {
    data?: Array<{ embedding?: number[]; index?: number }>;
    usage?: { total_tokens?: number };
  };

  const embeddings = data.data;
  if (!embeddings || !Array.isArray(embeddings)) {
    throw new Error("OpenAI returned invalid embeddings response");
  }

  // Sort by index to maintain order
  const sorted = embeddings.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  const tokensPerItem = Math.ceil(
    (data.usage?.total_tokens ?? 0) / cleanedTexts.length
  );

  return sorted.map((item) => ({
    vector: item.embedding ?? [],
    model: EMBEDDING_MODEL,
    tokensUsed: tokensPerItem,
  }));
}

/**
 * Compute cosine similarity between two vectors.
 * Returns a value between -1 and 1 (1 = identical, 0 = orthogonal, -1 = opposite).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}

/**
 * Find the most similar items from a collection of embeddings.
 */
export function findSimilar<T extends { vector: number[] }>(
  queryVector: number[],
  items: T[],
  limit: number = 5
): Array<T & { score: number }> {
  const scored = items.map((item) => ({
    ...item,
    score: cosineSimilarity(queryVector, item.vector),
  }));

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Build a text representation for embedding from a knowledge item.
 */
export function buildEmbeddingText(item: {
  title: string;
  summary: string;
  problems?: string[];
  techniques?: string[];
  commodities?: string[];
  regions?: string[];
  keywords?: string[];
}): string {
  const parts = [
    item.title,
    item.summary,
    item.problems?.length ? `Problems: ${item.problems.join(", ")}` : "",
    item.techniques?.length ? `Techniques: ${item.techniques.join(", ")}` : "",
    item.commodities?.length
      ? `Commodities: ${item.commodities.join(", ")}`
      : "",
    item.regions?.length ? `Regions: ${item.regions.join(", ")}` : "",
    item.keywords?.length ? `Keywords: ${item.keywords.join(", ")}` : "",
  ];

  return parts.filter(Boolean).join("\n");
}

/**
 * Build a query text for embedding from lead/project context.
 */
export function buildQueryText(query: {
  title: string;
  description?: string;
  commodities?: string[];
  region?: string;
  context?: string;
}): string {
  const parts = [
    query.title,
    query.description || "",
    query.commodities?.length
      ? `Commodities: ${query.commodities.join(", ")}`
      : "",
    query.region ? `Region: ${query.region}` : "",
    query.context || "",
  ];

  return parts.filter(Boolean).join("\n");
}
