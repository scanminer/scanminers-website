// app/api/admin/improve-content/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import matter from "gray-matter";
import { improveMdxBodyWithPerplexity } from "@/lib/ai/perplexity";
import { makeOctokit, getDefaultBranchSha, createBranchFrom, getFileContent, commitFile, openPr } from "@/lib/github";
import { allInsights, allCaseStudies, allBriefs } from "contentlayer/generated";
import type { Insight, CaseStudy, Brief } from "contentlayer/generated";

export const runtime = "nodejs";

const PreviewBody = z.object({
  kind: z.enum(["insight", "case", "brief"]).default("insight"),
  slug: z.string().min(2),
  prompt: z.string().min(4),
  confirm: z.boolean().default(false),
  mdx: z.string().optional(), // if provided on confirm, commit this directly
});

function findDoc(kind: "insight" | "case" | "brief", slug: string) {
  if (kind === "insight") return (allInsights as Insight[]).find((d) => d.slug === slug);
  if (kind === "case") return (allCaseStudies as CaseStudy[]).find((d) => d.slug === slug);
  return (allBriefs as (Brief & { slugAsParams?: string; slug?: string })[]).find((d) => d.slugAsParams === slug || d.slug === slug);
}

function pathFromDoc(doc: Insight | CaseStudy | Brief): string {
  const raw = (doc as unknown as { _raw?: { sourceFilePath?: string } })._raw;
  return raw?.sourceFilePath || "";
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { kind, slug, prompt, confirm, mdx } = PreviewBody.parse(json);

    const GH_REPO = process.env.GH_REPO || process.env.CONTENT_REPO;
    const TOKEN = process.env.CONTENT_BOT_TOKEN;
    const BASE = process.env.GIT_DEFAULT_BRANCH || process.env.CONTENT_DEFAULT_BRANCH || "main";

    if (!GH_REPO || !TOKEN) {
      return NextResponse.json(
        { ok: false, error: "Missing GH_REPO/CONTENT_REPO or CONTENT_BOT_TOKEN." },
        { status: 400 }
      );
    }

    const doc = findDoc(kind, slug);
    if (!doc) return NextResponse.json({ ok: false, error: "Doc not found in contentlayer." }, { status: 404 });
    const path = pathFromDoc(doc);
    if (!path) return NextResponse.json({ ok: false, error: "Unable to resolve file path." }, { status: 400 });

    const octokit = makeOctokit(TOKEN);

    // Load current MDX from base
    const { text: current, sha } = await getFileContent(octokit, GH_REPO, path, BASE);
    const parsed = matter(current);

    if (!confirm) {
      // Preview mode: call AI to improve only the body
      const improvedBody = await improveMdxBodyWithPerplexity({
        body: parsed.content.trim(),
        prompt,
        type: kind,
      });
      const previewMdx = matter.stringify(improvedBody.trimStart() + "\n", parsed.data as Record<string, unknown>);
      const originalMdx = matter.stringify(parsed.content.trimStart() + "\n", parsed.data as Record<string, unknown>);
      return NextResponse.json({ ok: true, mode: "preview", mdx: previewMdx, originalMdx });
    }

    // Confirm/commit mode
    const newMdx = mdx && mdx.length > 0
      ? mdx
      : matter.stringify(
          (await improveMdxBodyWithPerplexity({ body: parsed.content.trim(), prompt, type: kind })).trimStart() + "\n",
          parsed.data as Record<string, unknown>
        );

    // Create improvement branch
    const iso = new Date().toISOString().replace(/[:.]/g, "-");
    const branch = `improve/${kind}/${slug}-${iso}`;
    const fromSha = await getDefaultBranchSha(octokit, GH_REPO, BASE);
    await createBranchFrom(octokit, GH_REPO, branch, fromSha);

    await commitFile(
      octokit,
      GH_REPO,
      path,
      newMdx,
      `improve(${kind}): AI edits for ${slug}`,
      branch,
      sha
    );

    const prTitle = `Improve: ${(doc as Insight | CaseStudy | Brief).title || slug}`;
    const prBody = `This PR applies AI-assisted edits to the ${kind} at \`${path}\` with prompt: \n\n> ${prompt}`;
    const prUrl = await openPr(octokit, GH_REPO, branch, BASE, prTitle, prBody);

  return NextResponse.json({ ok: true, mode: "commit", prUrl, branch });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
