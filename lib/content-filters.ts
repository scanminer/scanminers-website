/**
 * Content visibility filtering for status-based publishing workflow
 * 
 * Rules:
 * - status="published" → always visible
 * - status="scheduled" + publishAt ≤ now → visible
 * - status="scheduled" + publishAt > now → hidden
 * - status="draft" or "review" → hidden
 * - Missing status field → default to published (backward compatibility)
 */

type ContentEntry = {
  status?: string;
  publishAt?: string;
};

/**
 * Determines if content should be visible on public pages
 * @param entry Content with optional status and publishAt fields
 * @returns true if content should be shown publicly
 */
export function isContentVisible(entry: ContentEntry): boolean {
  // Backward compatibility: treat missing status as published
  if (!entry.status || entry.status === "published") {
    return true;
  }

  // Scheduled content: check if publishAt date has passed
  if (entry.status === "scheduled") {
    if (!entry.publishAt) {
      // Scheduled without date → treat as draft (hidden)
      return false;
    }

    try {
      const publishDate = new Date(entry.publishAt);
      const now = new Date();
      return publishDate <= now;
    } catch {
      // Invalid date format → hide to be safe
      return false;
    }
  }

  // Draft and review content always hidden
  return false;
}

/**
 * Filter array of content entries to only visible items
 * @param entries Array of content with status/publishAt fields
 * @returns Filtered array of visible content
 */
export function filterVisibleContent<T extends ContentEntry>(entries: T[]): T[] {
  return entries.filter(isContentVisible);
}
