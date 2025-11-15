/**
 * OG Image Prompt Generation
 * 
 * Generates visual prompts for Stability AI to create social media OG images
 * for Insights and Case Studies.
 */

type ContentEntry = {
  title: string;
  summary: string;
  region: string;
  commodities?: string[];
  commodity?: string | string[];
  mineral?: string;
};

/**
 * Generate a Stability AI image prompt for OG images
 * @param content Content entry with title, summary, region, commodities
 * @returns Visual prompt string (50-80 words)
 */
export function generateOgImagePrompt(content: ContentEntry): string {
  // Extract commodities
  const commodities = content.commodities 
    ? content.commodities 
    : Array.isArray(content.commodity)
    ? content.commodity
    : typeof content.commodity === "string"
    ? [content.commodity]
    : [];

  const commodityStr = commodities.length > 0 ? commodities.join(", ") : "minerals";

  // Build prompt focused on geological/geospatial aesthetics with Scanminers brand colors
  const mineralLabel = content.mineral ? content.mineral.replace(/-/g, " ") : "critical mineral";
  const mineralHint = `Featuring ${mineralLabel} mineral textures with metallic veining to reinforce the geology theme.`;

  const prompt = `Professional technical visualization for ${commodityStr} exploration in ${content.region}. 
    Satellite imagery style with topographic contours, heatmap overlays showing prospectivity zones, 
    and geospatial data visualization elements. ${mineralHint} Modern scientific aesthetic using deep blue (#003C6D), 
    emerald green (#007A5A), and amber-orange (#F08A24) color palette inspired by geoscience and AI. 
    No text, no people, no logos. Emphasis on geological features, remote sensing data patterns, and mineral targeting.`;

  return prompt.replace(/\s+/g, " ").trim();
}

/**
 * Get fallback prompt for content without full metadata
 */
export function getDefaultOgPrompt(): string {
  return `Professional geospatial data visualization showing critical mineral prospectivity mapping. 
    Satellite imagery with topographic overlays, heatmap gradients in deep blue (#003C6D), 
    emerald green (#007A5A), and amber-orange (#F08A24). Clean scientific aesthetic with 
    technical data elements. No text overlays, emphasis on Earth observation and AI-driven targeting.`;
}
