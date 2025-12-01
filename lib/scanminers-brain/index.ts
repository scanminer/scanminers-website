/**
 * Scanminers Brain v0.1 - Index Barrel
 *
 * Re-exports all public APIs from the scanminers-brain module.
 */

// Types
export type {
  KnowledgeItem,
  KnowledgeStore,
  EmbeddingRecord,
  BrainQuery,
  BrainResponse,
  RelatedKnowledgeResult,
  ETLResult,
} from "./types";

export {
  KnowledgeItemSchema,
  BrainQuerySchema,
  BrainResponseSchema,
} from "./types";

// Embeddings
export {
  createEmbedding,
  createEmbeddings,
  cosineSimilarity,
  findSimilar,
  buildEmbeddingText,
  buildQueryText,
} from "./embeddings";

// Store
export {
  loadStore,
  saveStore,
  getKnowledgeItem,
  getKnowledgeItemBySlug,
  getAllKnowledgeItems,
  upsertKnowledgeItem,
  deleteKnowledgeItem,
  getEmbedding,
  getAllEmbeddings,
  upsertEmbedding,
  getItemsWithEmbeddings,
  getStoreStats,
} from "./store";

// Extraction
export { extractKnowledge, createKnowledgeItem } from "./extraction";

// Query
export { queryBrain } from "./query";
