#!/usr/bin/env node
/**
 * Scanminers Brain v0.1 - ETL Pipeline
 *
 * Reads MDX insights, extracts structured knowledge via GPT-4,
 * generates embeddings, and stores everything in the knowledge base.
 *
 * Usage:
 *   npx tsx scripts/brain-etl.ts
 *   npx tsx scripts/brain-etl.ts --force  # Re-process all items
 */

import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import {
  extractKnowledge,
  createKnowledgeItem,
} from "../lib/scanminers-brain/extraction";
import {
  createEmbedding,
  buildEmbeddingText,
} from "../lib/scanminers-brain/embeddings";
import {
  loadStore,
  saveStore,
  getKnowledgeItemBySlug,
} from "../lib/scanminers-brain/store";
import type { ETLResult, EmbeddingRecord } from "../lib/scanminers-brain/types";

const INSIGHTS_DIR = path.join(process.cwd(), "content", "insights");
const CASE_STUDIES_DIR = path.join(process.cwd(), "content", "case-studies");

async function getMdxFiles(dir: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dir);
    return files
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => path.join(dir, f));
  } catch {
    return [];
  }
}

async function parseMdxFile(filePath: string): Promise<{
  slug: string;
  title: string;
  content: string;
  frontmatter: Record<string, unknown>;
} | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(raw);

    const slug = (data.slug as string) || path.basename(filePath, ".mdx");

    const title = (data.title as string) || slug;

    return {
      slug,
      title,
      content,
      frontmatter: data,
    };
  } catch (error) {
    console.error(`Failed to parse ${filePath}:`, error);
    return null;
  }
}

async function processItem(
  filePath: string,
  type: "insight" | "case_study",
  force: boolean
): Promise<{ created: boolean; updated: boolean; error?: string }> {
  const parsed = await parseMdxFile(filePath);
  if (!parsed) {
    return { created: false, updated: false, error: "Failed to parse MDX" };
  }

  const { slug, title, content, frontmatter } = parsed;

  // Check if already exists
  if (!force) {
    const existing = await getKnowledgeItemBySlug(slug);
    if (existing) {
      console.log(`  ⏭ Skipping ${slug} (already exists)`);
      return { created: false, updated: false };
    }
  }

  console.log(`  📊 Extracting knowledge from: ${title}`);

  // Extract structured knowledge
  const extraction = await extractKnowledge(title, content, {
    commodity: frontmatter.commodity as string | string[] | undefined,
    region: frontmatter.region as string | undefined,
    tags: frontmatter.tags as string[] | undefined,
  });

  // Create knowledge item
  const item = createKnowledgeItem(slug, title, type, extraction, {
    publishedAt: frontmatter.publishedAt as string | undefined,
    sourceUrl:
      type === "insight" ? `/insights/${slug}` : `/case-studies/${slug}`,
  });

  console.log(`  🧠 Generating embedding for: ${title}`);

  // Generate embedding
  const embeddingText = buildEmbeddingText(item);
  const embeddingResult = await createEmbedding(embeddingText);

  const embeddingRecord: EmbeddingRecord = {
    id: `emb-${item.id}`,
    knowledgeId: item.id,
    vector: embeddingResult.vector,
    model: embeddingResult.model,
    createdAt: new Date().toISOString(),
  };

  // Store both
  const store = await loadStore();
  const existingIndex = store.items.findIndex((i) => i.id === item.id);

  if (existingIndex >= 0) {
    store.items[existingIndex] = item;
  } else {
    store.items.push(item);
  }

  const embeddingIndex = store.embeddings.findIndex(
    (e) => e.knowledgeId === item.id
  );
  if (embeddingIndex >= 0) {
    store.embeddings[embeddingIndex] = embeddingRecord;
  } else {
    store.embeddings.push(embeddingRecord);
  }

  await saveStore(store);

  return {
    created: existingIndex < 0,
    updated: existingIndex >= 0,
  };
}

async function runETL(force: boolean = false): Promise<ETLResult> {
  const startTime = Date.now();
  const errors: Array<{ slug: string; error: string }> = [];
  let processed = 0;
  let created = 0;
  let updated = 0;

  console.log("🧠 Scanminers Brain ETL Pipeline v0.1");
  console.log("=====================================\n");

  // Process insights
  console.log("📁 Processing insights...");
  const insightFiles = await getMdxFiles(INSIGHTS_DIR);
  console.log(`   Found ${insightFiles.length} insight files\n`);

  for (const file of insightFiles) {
    const slug = path.basename(file, ".mdx");
    try {
      const result = await processItem(file, "insight", force);
      processed++;
      if (result.created) created++;
      if (result.updated) updated++;
      if (result.error) errors.push({ slug, error: result.error });

      // Rate limiting - wait 1s between API calls
      await new Promise((r) => setTimeout(r, 1000));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`  ❌ Error processing ${slug}: ${errorMsg}`);
      errors.push({ slug, error: errorMsg });
    }
  }

  // Process case studies
  console.log("\n📁 Processing case studies...");
  const caseStudyFiles = await getMdxFiles(CASE_STUDIES_DIR);
  console.log(`   Found ${caseStudyFiles.length} case study files\n`);

  for (const file of caseStudyFiles) {
    const slug = path.basename(file, ".mdx");
    try {
      const result = await processItem(file, "case_study", force);
      processed++;
      if (result.created) created++;
      if (result.updated) updated++;
      if (result.error) errors.push({ slug, error: result.error });

      // Rate limiting
      await new Promise((r) => setTimeout(r, 1000));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`  ❌ Error processing ${slug}: ${errorMsg}`);
      errors.push({ slug, error: errorMsg });
    }
  }

  const duration = Date.now() - startTime;

  console.log("\n=====================================");
  console.log("📊 ETL Summary:");
  console.log(`   Items processed: ${processed}`);
  console.log(`   Items created: ${created}`);
  console.log(`   Items updated: ${updated}`);
  console.log(`   Errors: ${errors.length}`);
  console.log(`   Duration: ${(duration / 1000).toFixed(1)}s`);

  if (errors.length > 0) {
    console.log("\n❌ Errors:");
    errors.forEach((e) => console.log(`   - ${e.slug}: ${e.error}`));
  }

  return {
    success: errors.length === 0,
    itemsProcessed: processed,
    itemsCreated: created,
    itemsUpdated: updated,
    errors,
    duration,
  };
}

// Run if called directly
const args = process.argv.slice(2);
const force = args.includes("--force") || args.includes("-f");

runETL(force)
  .then((result) => {
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
