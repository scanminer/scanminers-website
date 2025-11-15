#!/usr/bin/env tsx

/**
 * Generate OG Images for Published Content
 * 
 * Usage:
 *   npm run generate-og-images
 *   or
 *   tsx scripts/generate-og-images.ts
 * 
 * Requirements:
 *   - STABILITY_API_KEY environment variable
 *   - Published Insights and Case Studies in Contentlayer
 * 
 * This script:
 *   1. Iterates over all published Insights and Case Studies
 *   2. Generates Stability AI prompts using lib/og-prompts
 *   3. Calls Stability AI API to generate 1200x630 images
 *   4. Saves images to public/og/<slug>.png
 *   5. Skips items that already have OG files (unless --force flag)
 */

import fs from "fs";
import path from "path";
import { allInsights, allCaseStudies } from "../.contentlayer/generated/index.mjs";
import { getMineralImage, MINERAL_IMAGES } from "../lib/mineral-images";
import { generateOgImagePrompt } from "../lib/og-prompts";

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const OG_DIR = path.join(process.cwd(), "public", "og");
const FORCE_REGENERATE = process.argv.includes("--force");

// Ensure OG directory exists
if (!fs.existsSync(OG_DIR)) {
  fs.mkdirSync(OG_DIR, { recursive: true });
  console.log(`✓ Created directory: ${OG_DIR}`);
}

type ContentItem = typeof allInsights[0] | typeof allCaseStudies[0];

function resolveMineral(mineral?: string): string {
  if (!mineral) return "default";
  const normalized = mineral.toLowerCase().trim();
  return MINERAL_IMAGES[normalized] ? normalized : "default";
}

/**
 * Check if content should be processed (published only)
 */
function isPublished(item: ContentItem): boolean {
  const entry = item as ContentItem & { status?: string; publishAt?: string };
  
  if (!entry.status || entry.status === "published") {
    return true;
  }
  
  if (entry.status === "scheduled" && entry.publishAt) {
    return new Date(entry.publishAt) <= new Date();
  }
  
  return false;
}

/**
 * Generate OG image via Stability AI
 */
async function generateImage(prompt: string, outputPath: string): Promise<void> {
  if (!STABILITY_API_KEY) {
    throw new Error("STABILITY_API_KEY environment variable not set");
  }

  console.log(`  Generating image with prompt: "${prompt.slice(0, 80)}..."`);

  const response = await fetch("https://api.stability.ai/v2beta/stable-image/generate/core", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${STABILITY_API_KEY}`,
      "Accept": "image/*",
    },
    body: new URLSearchParams({
      prompt,
      output_format: "png",
      aspect_ratio: "16:9", // 1200x630 is roughly 16:9
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stability AI error: ${response.status} ${errorText}`);
  }

  const imageBuffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(imageBuffer));
  
  console.log(`  ✓ Saved: ${path.basename(outputPath)}`);
}

/**
 * Process a single content item
 */
async function processItem(item: ContentItem, type: "insight" | "case-study"): Promise<void> {
  const ogPath = path.join(OG_DIR, `${item.slug}.png`);
  
  // Skip if already exists (unless force flag)
  if (!FORCE_REGENERATE && fs.existsSync(ogPath)) {
    console.log(`⊘ Skipping ${item.slug} (already exists)`);
    return;
  }

  console.log(`\n→ Processing ${type}: ${item.slug}`);
  console.log(`  Title: ${item.title}`);

  const itemWithMineral = item as ContentItem & { imageMineral?: string };
  const mineralKey = resolveMineral(itemWithMineral.imageMineral);
  const mineralImagePath = getMineralImage(mineralKey);
  console.log(`  Mineral background: ${mineralKey} (${mineralImagePath})`);

  try {
    // Generate prompt
    const itemWithCommodities = item as ContentItem & { commodities?: string[]; commodity?: string | string[] };
    const commodities = itemWithCommodities.commodities 
      ? itemWithCommodities.commodities 
      : itemWithCommodities.commodity
      ? (Array.isArray(itemWithCommodities.commodity) ? itemWithCommodities.commodity : [itemWithCommodities.commodity])
      : [];

    const prompt = generateOgImagePrompt({
      title: item.title,
      summary: item.summary,
      region: item.region,
      commodities,
      mineral: mineralKey,
    });

    // Generate and save image
    await generateImage(prompt, ogPath);
    
  } catch (error) {
    console.error(`  ✗ Error processing ${item.slug}:`, error);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log("=".repeat(60));
  console.log("OG Image Generation for Scanminers");
  console.log("=".repeat(60));

  if (!STABILITY_API_KEY) {
    console.error("\n✗ Error: STABILITY_API_KEY not found in environment");
    console.error("  Set it with: export STABILITY_API_KEY=your_key_here\n");
    process.exit(1);
  }

  // Filter to published content only
  const publishedInsights = allInsights.filter(isPublished);
  const publishedCaseStudies = allCaseStudies.filter(isPublished);

  console.log(`\nFound ${publishedInsights.length} published insights`);
  console.log(`Found ${publishedCaseStudies.length} published case studies`);
  console.log(`Output directory: ${OG_DIR}`);
  console.log(`Force regenerate: ${FORCE_REGENERATE ? "YES" : "NO"}\n`);

  // Process insights
  for (const insight of publishedInsights) {
    await processItem(insight, "insight");
  }

  // Process case studies
  for (const caseStudy of publishedCaseStudies) {
    await processItem(caseStudy, "case-study");
  }

  console.log("\n" + "=".repeat(60));
  console.log("✓ OG image generation complete");
  console.log("=".repeat(60) + "\n");
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("\n✗ Fatal error:", error);
    process.exit(1);
  });
}
