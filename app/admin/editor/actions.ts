"use server";

import { revalidatePath } from "next/cache";
import matter from "gray-matter";
import { allInsights, allCaseStudies } from "contentlayer/generated";
import { getOctokit, createBranchFrom, commitFile, openPr } from "@/lib/github";
import { getAdminActorName } from "@/lib/admin-actor";
import { buildBrandSystemPrompt } from "@/lib/ai-brand";
import { createChatCompletion } from "@/lib/ai/openai";
import { requireAdminSession } from "@/lib/admin-session";

export type ContentType = "insight" | "case-study";

export type ContentFrontmatter = {
  slug: string;
  title: string;
  publishedAt: string;
  region: string;
  summary: string;
  commodity: string | string[];
  tags: string[];
  image: string;
  imageAlt?: string;
  imagePrompt: string;
  review_status: "needs-review" | "approved";
  ai_generated?: boolean;
  status?: "draft" | "review" | "scheduled" | "published";
  publishAt?: string;
  citations?: string[];
  provenance?: string[];
  coverImage?: string;
};

type SaveContentInput = {
  type: ContentType;
  slug: string;
  frontmatter: ContentFrontmatter;
  body: string;
};

type ActionResponse = {
  ok: boolean;
  error?: string;
  prUrl?: string;
};

const CONTENT_PATHS: Record<ContentType, string> = {
  insight: "content/insights",
  "case-study": "content/case-studies",
};

function resolveContentPath(type: ContentType, slug: string): string {
  return `${CONTENT_PATHS[type]}/${slug}.mdx`;
}

function serializeFrontmatter(frontmatter: ContentFrontmatter): string {
  const normalized: Record<string, unknown> = { ...frontmatter };
  
  // Ensure arrays are properly formatted
  if (typeof normalized.commodity === "string") {
    normalized.commodity = [normalized.commodity];
  }
  
  // Remove undefined values
  Object.keys(normalized).forEach((key) => {
    if (normalized[key] === undefined) {
      delete normalized[key];
    }
  });
  
  return matter.stringify("", normalized);
}

async function persistContentViaGit(input: SaveContentInput): Promise<{ prUrl: string }> {
  await requireAdminSession();
  const octokit = getOctokit();
  const owner = process.env.GITHUB_OWNER || process.env.GH_OWNER || "";
  const repoName = process.env.GITHUB_REPO || process.env.GH_REPO || "";
  
  if (!owner || !repoName) {
    throw new Error("GitHub repository configuration missing (GITHUB_OWNER, GITHUB_REPO)");
  }

  const repo = `${owner}/${repoName}`;
  const timestamp = Date.now();
  const branchName = `content/${input.type}/${input.slug}-${timestamp}`;
  const filePath = resolveContentPath(input.type, input.slug);
  
  // Create branch
  await createBranchFrom(octokit, repo, branchName, "main");
  
  // Serialize frontmatter + body
  const content = serializeFrontmatter(input.frontmatter) + input.body;
  
  // Commit file
  const actor = await getAdminActorName();
  const commitMessage = `feat(content): update ${input.type} - ${input.frontmatter.title}

Updated by: ${actor}
Status: ${input.frontmatter.status || "published"}
${input.frontmatter.publishAt ? `Scheduled for: ${input.frontmatter.publishAt}` : ""}`;

  await commitFile(octokit, repo, filePath, content, commitMessage, branchName);
  
  // Open PR
  const prTitle = `${input.frontmatter.status === "published" ? "Publish" : "Update"} ${input.type}: ${input.frontmatter.title}`;
  const prBody = [
    `## Content Update`,
    ``,
    `**Type:** ${input.type}`,
    `**Slug:** \`${input.slug}\``,
    `**Title:** ${input.frontmatter.title}`,
    `**Status:** ${input.frontmatter.status || "published"}`,
    `**Region:** ${input.frontmatter.region}`,
    `**Commodities:** ${Array.isArray(input.frontmatter.commodity) ? input.frontmatter.commodity.join(", ") : input.frontmatter.commodity}`,
    ``,
    `### Summary`,
    input.frontmatter.summary,
    ``,
    `---`,
    `Updated by: ${actor}`,
  ].join("\n");
  
  const prUrl = await openPr(octokit, repo, branchName, "main", prTitle, prBody);
  
  return { prUrl };
}

export async function saveContentDraftViaGit(
  type: ContentType,
  slug: string,
  frontmatter: ContentFrontmatter,
  body: string
): Promise<ActionResponse> {
  try {
    const { prUrl } = await persistContentViaGit({ type, slug, frontmatter, body });
    revalidatePath(`/admin/editor/${slug}`);
    revalidatePath(`/${type === "insight" ? "insights" : "case-studies"}/${slug}`);
    return { ok: true, prUrl };
  } catch (error) {
    console.error("[saveContentDraftViaGit]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to save content via Git",
    };
  }
}

export async function publishContentViaGit(
  type: ContentType,
  slug: string,
  frontmatter: ContentFrontmatter,
  body: string
): Promise<ActionResponse> {
  try {
    // Set status to published
    const publishedFrontmatter = {
      ...frontmatter,
      status: "published" as const,
      publishAt: undefined, // Clear scheduled date
    };
    
    const { prUrl } = await persistContentViaGit({ 
      type, 
      slug, 
      frontmatter: publishedFrontmatter, 
      body 
    });
    
    revalidatePath(`/admin/editor/${slug}`);
    revalidatePath(`/${type === "insight" ? "insights" : "case-studies"}`);
    revalidatePath(`/${type === "insight" ? "insights" : "case-studies"}/${slug}`);
    
    return { ok: true, prUrl };
  } catch (error) {
    console.error("[publishContentViaGit]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to publish content via Git",
    };
  }
}

// Social snippet generation types
type SocialSnippetResponse = {
  success: boolean;
  content?: string;
  error?: string;
};

// Helper to find content and extract context
function findContentBySlug(slug: string): { content: typeof allInsights[0] | typeof allCaseStudies[0]; type: ContentType } | null {
  const insight = allInsights.find((i) => i.slug === slug);
  if (insight) return { content: insight, type: "insight" };
  
  const caseStudy = allCaseStudies.find((cs) => cs.slug === slug);
  if (caseStudy) return { content: caseStudy, type: "case-study" };
  
  return null;
}

function extractBodyExcerpt(body: string, maxWords = 150): string {
  const words = body.split(/\s+/).filter(Boolean);
  return words.slice(0, maxWords).join(" ") + (words.length > maxWords ? "..." : "");
}

// LinkedIn post generation
export async function generateLinkedInPost(slug: string): Promise<SocialSnippetResponse> {
  await requireAdminSession();
  try {
    const result = findContentBySlug(slug);
    if (!result) {
      return { success: false, error: "Content not found" };
    }

    const { content, type } = result;
    const commodities = "commodities" in content ? content.commodities : [];
    
    const systemPrompt = buildBrandSystemPrompt({
      medium: "linkedin",
      audience: "executive",
      mineral: Array.isArray(commodities) ? commodities.join(", ") : String(commodities),
      geography: content.region,
    });

    const userPrompt = `Generate a LinkedIn post (300-500 words) for this ${type}:

Title: ${content.title}
Region: ${content.region}
Commodities: ${Array.isArray(commodities) ? commodities.join(", ") : commodities}
Summary: ${content.summary}

Content excerpt:
${extractBodyExcerpt(content.body.raw, 100)}

Requirements:
- Professional B2B tone for exploration leadership
- Lead with the insight/outcome, not the tool
- Include 2-3 relevant hashtags
- End with a question to drive engagement
- No promises of guaranteed discovery
- Cite data sources or methods where relevant`;

    const generatedContent = await createChatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 600,
      temperature: 0.7,
    });

    return { success: true, content: generatedContent };
  } catch (error) {
    console.error("[generateLinkedInPost]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate LinkedIn post",
    };
  }
}

// LinkedIn carousel outline generation
export async function generateLinkedInCarousel(slug: string): Promise<SocialSnippetResponse> {
  await requireAdminSession();
  try {
    const result = findContentBySlug(slug);
    if (!result) {
      return { success: false, error: "Content not found" };
    }

    const { content, type } = result;
    const commodities = "commodities" in content ? content.commodities : [];
    
    const systemPrompt = buildBrandSystemPrompt({
      medium: "linkedin",
      audience: "executive",
      mineral: Array.isArray(commodities) ? commodities.join(", ") : String(commodities),
      geography: content.region,
    });

    const userPrompt = `Generate a LinkedIn carousel outline (8-10 slides) for this ${type}:

Title: ${content.title}
Region: ${content.region}
Commodities: ${Array.isArray(commodities) ? commodities.join(", ") : commodities}
Summary: ${content.summary}

Content excerpt:
${extractBodyExcerpt(content.body.raw, 150)}

Requirements:
- Each slide: headline + 2-3 bullet points
- Slide 1: Hook with the key outcome
- Slides 2-7: Key insights, methods, or findings
- Slide 8: Takeaway + CTA
- Technical but accessible
- No marketing fluff`;

    const generatedContent = await createChatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 800,
      temperature: 0.7,
    });

    return { success: true, content: generatedContent };
  } catch (error) {
    console.error("[generateLinkedInCarousel]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate LinkedIn carousel",
    };
  }
}

// X (Twitter) post generation
export async function generateXPost(slug: string): Promise<SocialSnippetResponse> {
  await requireAdminSession();
  try {
    const result = findContentBySlug(slug);
    if (!result) {
      return { success: false, error: "Content not found" };
    }

    const { content, type } = result;
    const commodities = "commodities" in content ? content.commodities : [];
    
    const systemPrompt = buildBrandSystemPrompt({
      medium: "x",
      audience: "geoscience",
      mineral: Array.isArray(commodities) ? commodities.join(", ") : String(commodities),
      geography: content.region,
    });

    const userPrompt = `Generate an X (Twitter) post (240 characters max) for this ${type}:

Title: ${content.title}
Region: ${content.region}
Commodities: ${Array.isArray(commodities) ? commodities.join(", ") : commodities}
Summary: ${content.summary}

Requirements:
- Punchy, technical, specific
- Lead with the outcome or method
- 1-2 relevant hashtags max
- Include a link placeholder: [LINK]
- No emoji unless highly relevant`;

    const generatedContent = await createChatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 150,
      temperature: 0.6,
    });

    return { success: true, content: generatedContent };
  } catch (error) {
    console.error("[generateXPost]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate X post",
    };
  }
}

// Email teaser generation
export async function generateEmailTeaser(slug: string): Promise<SocialSnippetResponse> {
  await requireAdminSession();
  try {
    const result = findContentBySlug(slug);
    if (!result) {
      return { success: false, error: "Content not found" };
    }

    const { content, type } = result;
    const commodities = "commodities" in content ? content.commodities : [];
    
    const systemPrompt = buildBrandSystemPrompt({
      medium: "email",
      audience: "executive",
      mineral: Array.isArray(commodities) ? commodities.join(", ") : String(commodities),
      geography: content.region,
    });

    const userPrompt = `Generate an email newsletter teaser (100-150 words) for this ${type}:

Title: ${content.title}
Region: ${content.region}
Commodities: ${Array.isArray(commodities) ? commodities.join(", ") : commodities}
Summary: ${content.summary}

Content excerpt:
${extractBodyExcerpt(content.body.raw, 80)}

Requirements:
- Subject line + body
- Professional, direct, value-first
- Highlight key takeaway or method
- End with clear CTA: "Read the full ${type} →"
- No hype or superlatives`;

    const generatedContent = await createChatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 300,
      temperature: 0.6,
    });

    return { success: true, content: generatedContent };
  } catch (error) {
    console.error("[generateEmailTeaser]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate email teaser",
    };
  }
}

// OG image prompt generation (optional)
export async function generateOgImagePrompt(slug: string): Promise<SocialSnippetResponse> {
  await requireAdminSession();
  try {
    const result = findContentBySlug(slug);
    if (!result) {
      return { success: false, error: "Content not found" };
    }

    const { content } = result;
    const commodities = "commodities" in content ? content.commodities : [];
    
    const systemPrompt = "You are an expert at writing image generation prompts for Stability AI that create professional, technical imagery for geoscience and mining content.";

    const userPrompt = `Generate a Stability AI image prompt for:

Title: ${content.title}
Region: ${content.region}
Commodities: ${Array.isArray(commodities) ? commodities.join(", ") : commodities}
Summary: ${content.summary}

Requirements:
- Professional, technical, non-sensational
- Reference geological features, satellite imagery, or data visualization
- Avoid people, logos, or text overlays
- Style: clean, modern, scientific
- 50-80 words`;

    const generatedContent = await createChatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 200,
      temperature: 0.7,
    });

    return { success: true, content: generatedContent };
  } catch (error) {
    console.error("[generateOgImagePrompt]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate OG image prompt",
    };
  }
}
