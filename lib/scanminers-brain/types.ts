/**
 * Scanminers Brain v0.1 - Type Definitions
 *
 * Core types for the knowledge retrieval system.
 */

import { z } from "zod";

// ============================================================================
// Knowledge Item Schema
// ============================================================================

export const KnowledgeItemSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(["insight", "case_study"]),
  sourceUrl: z.string().optional(),

  // Structured knowledge extracted by AI
  summary: z.string(),
  problems: z.array(z.string()).describe("Key problems/challenges addressed"),
  techniques: z
    .array(z.string())
    .describe("Remote sensing / AI techniques used"),
  dataRequirements: z.array(z.string()).describe("Data inputs needed"),
  commodities: z.array(z.string()).describe("Minerals/commodities covered"),
  regions: z.array(z.string()).describe("Geographic regions if mentioned"),
  risks: z.array(z.string()).describe("Risks or limitations noted"),
  outcomes: z.array(z.string()).describe("Key outcomes or results"),
  keywords: z.array(z.string()).describe("Search keywords"),

  // Metadata
  publishedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),

  // Embedding vector (stored separately for efficiency)
  embeddingId: z.string().optional(),
});

export type KnowledgeItem = z.infer<typeof KnowledgeItemSchema>;

// ============================================================================
// Embedding Storage
// ============================================================================

export const EmbeddingRecordSchema = z.object({
  id: z.string(),
  knowledgeId: z.string(),
  vector: z.array(z.number()),
  model: z.string().default("text-embedding-3-small"),
  createdAt: z.string(),
});

export type EmbeddingRecord = z.infer<typeof EmbeddingRecordSchema>;

// ============================================================================
// Knowledge Store (JSON file format)
// ============================================================================

export const KnowledgeStoreSchema = z.object({
  version: z.string().default("0.1.0"),
  lastUpdated: z.string(),
  items: z.array(KnowledgeItemSchema),
  embeddings: z.array(EmbeddingRecordSchema),
});

export type KnowledgeStore = z.infer<typeof KnowledgeStoreSchema>;

// ============================================================================
// API Request/Response Types
// ============================================================================

export const BrainQuerySchema = z.object({
  leadId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  commodities: z.array(z.string()).optional().default([]),
  region: z.string().optional().default(""),
  context: z.string().optional().default(""),
  limit: z.number().min(1).max(10).optional().default(5),
});

export type BrainQuery = z.infer<typeof BrainQuerySchema>;

export const RelatedKnowledgeResultSchema = z.object({
  item: KnowledgeItemSchema,
  score: z.number().describe("Similarity score 0-1"),
  relevanceReason: z.string().describe("AI explanation of relevance"),
});

export type RelatedKnowledgeResult = z.infer<
  typeof RelatedKnowledgeResultSchema
>;

export const BrainResponseSchema = z.object({
  query: z.object({
    title: z.string(),
    commodities: z.array(z.string()),
    region: z.string(),
  }),
  results: z.array(RelatedKnowledgeResultSchema),
  assessment: z.object({
    overallFit: z.enum(["strong", "moderate", "weak"]),
    summary: z
      .string()
      .describe("AI summary of how knowledge relates to query"),
    suggestedDataNeeds: z.array(z.string()),
    potentialRisks: z.array(z.string()),
    recommendedNextSteps: z.array(z.string()),
  }),
  metadata: z.object({
    totalKnowledgeItems: z.number(),
    queryEmbeddingModel: z.string(),
    processingTimeMs: z.number(),
  }),
});

export type BrainResponse = z.infer<typeof BrainResponseSchema>;

// ============================================================================
// ETL Types
// ============================================================================

export const ETLResultSchema = z.object({
  success: z.boolean(),
  itemsProcessed: z.number(),
  itemsCreated: z.number(),
  itemsUpdated: z.number(),
  errors: z.array(
    z.object({
      slug: z.string(),
      error: z.string(),
    })
  ),
  duration: z.number(),
});

export type ETLResult = z.infer<typeof ETLResultSchema>;
