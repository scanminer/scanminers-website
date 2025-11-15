/**
 * OG Image Metadata Helpers
 * 
 * Provides utilities for including OG images in Next.js metadata.
 * Falls back to default image if specific OG image doesn't exist.
 */

import { absoluteUrl } from "./url";

const DEFAULT_OG_IMAGE = "/og-default.svg";
const OG_DIR = "/og";

/**
 * Get OG image URL for a content slug
 * @param slug Content slug (e.g., "bauxite-mapping-advances")
 * @returns Absolute URL to OG image
 */
export function getOgImageUrl(slug: string): string {
  // In production, check if file exists and use it
  // For now, return the expected path (images generated at build time)
  const ogPath = `${OG_DIR}/${slug}.png`;
  
  // Note: Actual file existence check happens at build time via generate-og-images script
  // At runtime (especially on Cloudflare), we can't check filesystem
  return absoluteUrl(ogPath);
}

/**
 * Get default OG image URL
 */
export function getDefaultOgImageUrl(): string {
  return absoluteUrl(DEFAULT_OG_IMAGE);
}

/**
 * Get OG image metadata object for Next.js metadata
 * @param slug Content slug, or null for default
 */
export function getOgImageMetadata(slug?: string) {
  const url = slug ? getOgImageUrl(slug) : getDefaultOgImageUrl();
  
  return {
    url,
    width: 1200,
    height: 630,
    alt: "Scanminers - Critical Mineral Prospectivity",
  };
}

/**
 * Complete OpenGraph metadata with image
 * @param options OG metadata options
 */
export function buildOgMetadata(options: {
  title: string;
  description: string;
  url: string;
  slug?: string;
  type?: "website" | "article";
}) {
  const { title, description, url, slug, type = "website" } = options;
  
  return {
    title,
    description,
    url,
    type,
    images: [getOgImageMetadata(slug)],
  };
}

/**
 * Complete Twitter Card metadata with image
 * @param options Twitter metadata options
 */
export function buildTwitterMetadata(options: {
  title: string;
  description: string;
  slug?: string;
  card?: "summary" | "summary_large_image";
}) {
  const { title, description, slug, card = "summary_large_image" } = options;
  
  return {
    card,
    title,
    description,
    images: [slug ? getOgImageUrl(slug) : getDefaultOgImageUrl()],
  };
}
