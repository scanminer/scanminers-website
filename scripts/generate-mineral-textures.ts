#!/usr/bin/env tsx
/**
 * Generate Mineral Textures
 *
 * Batch-generates all 18 canonical mineral textures using Stability AI Core API.
 * Uses the prompts and specs from lib/mineral-images.ts.
 *
 * Usage:
 *   STABILITY_API_KEY=sk-... npm run generate-mineral-textures
 *   # Or with force regeneration:
 *   STABILITY_API_KEY=sk-... npm run generate-mineral-textures -- --force
 */

import fs from 'fs';
import path from 'path';
import { MINERAL_TEXTURE_SPECS } from '../lib/mineral-images';

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'minerals');
const FORCE_REGENERATE = process.argv.includes('--force');

if (!STABILITY_API_KEY) {
  console.error('❌ STABILITY_API_KEY environment variable is required');
  process.exit(1);
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

interface StabilityResponse {
  artifacts: Array<{
    base64: string;
    seed: number;
    finishReason: string;
  }>;
}

async function generateTexture(
  slug: string,
  prompt: string,
  outputPath: string,
): Promise<void> {
  console.log(`\n🎨 Generating ${slug}...`);
  console.log(`   Prompt: ${prompt.substring(0, 80)}...`);

  const response = await fetch(
    'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${STABILITY_API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1,
          },
        ],
        cfg_scale: 7,
        height: 640,
        width: 1536,
        samples: 1,
        steps: 30,
        style_preset: 'photographic',
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Stability API error (${response.status}): ${errorText}`,
    );
  }

  const data = (await response.json()) as StabilityResponse;

  if (!data.artifacts || data.artifacts.length === 0) {
    throw new Error('No artifacts returned from Stability API');
  }

  const imageData = data.artifacts[0].base64;
  const buffer = Buffer.from(imageData, 'base64');

  // Save as PNG first (Stability returns PNG)
  const pngPath = outputPath.replace('.webp', '.png');
  fs.writeFileSync(pngPath, buffer);
  console.log(`   ✓ Saved PNG: ${path.basename(pngPath)}`);

  // Convert to WebP and resize to 1920x1080 using sharp (if available)
  try {
    const sharp = await import('sharp');
    await sharp
      .default(buffer)
      .resize(1920, 1080, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 90 })
      .toFile(outputPath);
    console.log(`   ✓ Resized to 1920x1080 and converted to WebP: ${path.basename(outputPath)}`);
    
    // Remove PNG after successful conversion
    fs.unlinkSync(pngPath);
  } catch {
    console.log(`   ⚠️  Sharp not available, keeping PNG at original size`);
    // Rename PNG to match expected WebP name for consistency
    fs.renameSync(pngPath, outputPath.replace('.webp', '.png'));
  }

  // Rate limit: wait 3 seconds between requests to avoid hitting API limits
  await new Promise((resolve) => setTimeout(resolve, 3000));
}

async function main() {
  console.log('🪨 Mineral Texture Generator');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`🔄 Force regenerate: ${FORCE_REGENERATE ? 'Yes' : 'No'}`);
  console.log(`🎯 Generating ${MINERAL_TEXTURE_SPECS.length} textures`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const spec of MINERAL_TEXTURE_SPECS) {
    const outputPath = path.join(OUTPUT_DIR, `${spec.slug}.webp`);
    const pngFallback = path.join(OUTPUT_DIR, `${spec.slug}.png`);

    // Check if file already exists (WebP or PNG)
    if (!FORCE_REGENERATE && (fs.existsSync(outputPath) || fs.existsSync(pngFallback))) {
      console.log(`⏭️  Skipping ${spec.slug} (already exists)`);
      skipped++;
      continue;
    }

    try {
      await generateTexture(spec.slug, spec.prompt, outputPath);
      generated++;
    } catch (error) {
      console.error(`   ❌ Failed to generate ${spec.slug}:`, error);
      failed++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary:');
  console.log(`   ✓ Generated: ${generated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (failed > 0) {
    console.error('⚠️  Some textures failed to generate. Check errors above.');
    process.exit(1);
  }

  if (generated > 0) {
    console.log('✅ All textures generated successfully!');
    console.log('💡 Next: Update lib/mineral-images.ts to use .webp extensions');
  } else {
    console.log('✅ All textures already exist. Use --force to regenerate.');
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
