"use server";

import { revalidatePath } from "next/cache";
import matter from "gray-matter";
import { getOctokit, createBranchFrom, commitFile, openPr } from "@/lib/github";
import { getAdminActorName } from "@/lib/admin-actor";

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
  const actor = getAdminActorName();
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
