/**
 * Scanminers Brain v0.1 - Knowledge Store
 *
 * Edge-compatible storage for knowledge items and embeddings.
 * Uses static import for production, fs for local ETL.
 */

import type { KnowledgeItem, KnowledgeStore, EmbeddingRecord } from "./types";

// Static import for Edge runtime (bundled at build time)
// This works because Next.js/OpenNext bundles JSON imports
let staticStore: KnowledgeStore | null = null;

try {
  // Dynamic import to avoid issues if file doesn't exist during build
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  staticStore = require("../../data/scanminers-brain.json") as KnowledgeStore;
} catch {
  // File doesn't exist yet - will be created by ETL
  staticStore = null;
}

/**
 * Get the default empty store structure.
 */
function getEmptyStore(): KnowledgeStore {
  return {
    version: "0.1.0",
    lastUpdated: new Date().toISOString(),
    items: [],
    embeddings: [],
  };
}

/**
 * Check if we're in an Edge/Worker runtime (no fs access)
 */
function isEdgeRuntime(): boolean {
  return (
    typeof process === "undefined" ||
    typeof (globalThis as Record<string, unknown>).EdgeRuntime !==
      "undefined" ||
    // Check for Cloudflare Workers environment
    typeof (globalThis as Record<string, unknown>).caches !== "undefined"
  );
}

/**
 * Load the knowledge store.
 * In Edge runtime: uses static import
 * In Node.js: uses fs for live reloading during ETL
 */
export async function loadStore(): Promise<KnowledgeStore> {
  // In Edge/Worker runtime, use the static import
  if (isEdgeRuntime()) {
    return staticStore ?? getEmptyStore();
  }

  // In Node.js (local dev/ETL), use fs for live reloading
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const storePath = path.join(process.cwd(), "data", "scanminers-brain.json");
    const data = await fs.readFile(storePath, "utf-8");
    return JSON.parse(data) as KnowledgeStore;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return getEmptyStore();
    }
    console.warn("Failed to load knowledge store, returning empty:", error);
    return getEmptyStore();
  }
}

/**
 * Save the knowledge store to disk.
 * Only works in Node.js environment (ETL scripts).
 */
export async function saveStore(store: KnowledgeStore): Promise<void> {
  if (isEdgeRuntime()) {
    console.warn("Cannot save store in Edge runtime");
    return;
  }

  const fs = await import("fs/promises");
  const path = await import("path");
  const storePath = path.join(process.cwd(), "data", "scanminers-brain.json");
  const dir = path.dirname(storePath);

  await fs.mkdir(dir, { recursive: true });
  store.lastUpdated = new Date().toISOString();
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf-8");

  // Update static store reference for subsequent reads
  staticStore = store;
}

/**
 * Get a knowledge item by ID.
 */
export async function getKnowledgeItem(
  id: string
): Promise<KnowledgeItem | null> {
  const store = await loadStore();
  return store.items.find((item) => item.id === id) ?? null;
}

/**
 * Get a knowledge item by slug.
 */
export async function getKnowledgeItemBySlug(
  slug: string
): Promise<KnowledgeItem | null> {
  const store = await loadStore();
  return store.items.find((item) => item.slug === slug) ?? null;
}

/**
 * Get all knowledge items.
 */
export async function getAllKnowledgeItems(): Promise<KnowledgeItem[]> {
  const store = await loadStore();
  return store.items;
}

/**
 * Upsert a knowledge item (create or update).
 */
export async function upsertKnowledgeItem(
  item: KnowledgeItem
): Promise<{ created: boolean }> {
  const store = await loadStore();
  const existingIndex = store.items.findIndex((i) => i.id === item.id);

  if (existingIndex >= 0) {
    store.items[existingIndex] = {
      ...item,
      updatedAt: new Date().toISOString(),
    };
    await saveStore(store);
    return { created: false };
  } else {
    store.items.push({
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await saveStore(store);
    return { created: true };
  }
}

/**
 * Delete a knowledge item by ID.
 */
export async function deleteKnowledgeItem(id: string): Promise<boolean> {
  const store = await loadStore();
  const initialLength = store.items.length;
  store.items = store.items.filter((item) => item.id !== id);

  if (store.items.length < initialLength) {
    // Also remove associated embedding
    store.embeddings = store.embeddings.filter((e) => e.knowledgeId !== id);
    await saveStore(store);
    return true;
  }
  return false;
}

/**
 * Get all knowledge items with their embeddings.
 */
export async function getItemsWithEmbeddings(): Promise<
  Array<{ item: KnowledgeItem; embedding: EmbeddingRecord | null }>
> {
  const store = await loadStore();
  return store.items.map((item) => ({
    item,
    embedding: store.embeddings.find((e) => e.knowledgeId === item.id) ?? null,
  }));
}

/**
 * Get the embedding for a knowledge item.
 */
export async function getEmbedding(
  itemId: string
): Promise<EmbeddingRecord | null> {
  const store = await loadStore();
  return store.embeddings.find((e) => e.knowledgeId === itemId) ?? null;
}

/**
 * Get all embeddings.
 */
export async function getAllEmbeddings(): Promise<EmbeddingRecord[]> {
  const store = await loadStore();
  return store.embeddings;
}

/**
 * Upsert an embedding (create or update).
 */
export async function upsertEmbedding(
  embedding: EmbeddingRecord
): Promise<void> {
  const store = await loadStore();
  const existingIndex = store.embeddings.findIndex(
    (e) => e.knowledgeId === embedding.knowledgeId
  );

  if (existingIndex >= 0) {
    store.embeddings[existingIndex] = embedding;
  } else {
    store.embeddings.push(embedding);
  }

  await saveStore(store);
}

/**
 * Get store statistics.
 */
export async function getStoreStats(): Promise<{
  version: string;
  itemCount: number;
  embeddingCount: number;
  lastUpdated: string;
}> {
  const store = await loadStore();
  return {
    version: store.version,
    itemCount: store.items.length,
    embeddingCount: store.embeddings.length,
    lastUpdated: store.lastUpdated,
  };
}
