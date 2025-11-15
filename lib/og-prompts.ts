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

  // Build prompt focused on geological/geospatial aesthetics
  const prompt = `Professional technical visualization for ${commodityStr} exploration in ${content.region}. 
    Satellite imagery style with topographic contours, heatmap overlays showing prospectivity zones, 
    and data visualization elements. Clean modern scientific aesthetic with blue-green-amber color palette. 
    No text, no people, no logos. Emphasis on geological features and remote sensing data patterns.`;

  return prompt.replace(/\s+/g, " ").trim();
}

/**
 * Get fallback prompt for content without full metadata
 */
export function getDefaultOgPrompt(): string {
  return `Professional geospatial data visualization showing critical mineral prospectivity mapping. 
    Satellite imagery with topographic overlays, heatmap gradients, and technical data elements. 
    Clean scientific aesthetic with blue-emerald-amber color scheme. No text overlays.`;
}
