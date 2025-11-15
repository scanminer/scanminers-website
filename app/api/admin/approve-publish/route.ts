// app/api/admin/approve-publish/route.ts
import { NextResponse } from "next/server";

import matter from "gray-matter";
import { makeOctokit, getDefaultBranchSha, createBranchFrom, getFileContent, commitFile, openPr } from "@/lib/github";
import { allInsights, allCaseStudies, allBriefs } from "contentlayer/generated";
import type { Insight, CaseStudy, Brief } from "contentlayer/generated";

type Kind = "insight" | "case" | "brief";
function findDoc(kind: Kind, slug: string): (Insight | CaseStudy | (Brief & { slugAsParams?: string; slug?: string })) | undefined {
  if (kind === "insight") return allInsights.find((d: Insight) => d.slug === slug);
  if (kind === "case") return allCaseStudies.find((d: CaseStudy) => d.slug === slug);
  return allBriefs.find((d: Brief & { slugAsParams?: string; slug?: string }) => d.slugAsParams === slug || d.slug === slug);
}

function docPathFromDoc(doc: Insight | CaseStudy | Brief): string {
  // Contentlayer raw path is relative to repo (e.g., 'content/insights/foo.mdx')
  // _raw is present on contentlayer docs but not in the public type; index access via unknown
  const raw = (doc as unknown as { _raw?: { sourceFilePath?: string } })._raw;
  return raw?.sourceFilePath || "";
}

export async function POST(req: Request) {
  try {
    const { slug, kind }: { slug: string; kind: Kind } = await req.json();

    const GH_REPO = process.env.GH_REPO;
    const TOKEN = process.env.CONTENT_BOT_TOKEN;
    const BASE = process.env.GIT_DEFAULT_BRANCH || "main";

    if (!GH_REPO || !TOKEN) {
      return NextResponse.json(
        { success: false, ok: false, error: "Missing GH_REPO or CONTENT_BOT_TOKEN." },
        { status: 400 }
      );
    }

    const doc = findDoc(kind, slug);
    if (!doc) {
      return NextResponse.json({ success: false, ok: false, error: "Doc not found in contentlayer." }, { status: 404 });
    }

    const path = docPathFromDoc(doc);
    if (!path) {
  return NextResponse.json({ success: false, ok: false, error: "Unable to resolve file path for doc." }, { status: 400 });
    }

    const octokit = makeOctokit(TOKEN);

    // Create short-lived branch
    const iso = new Date().toISOString().replace(/[:.]/g, "-");
    const branch = `publish/${kind}/${slug}-${iso}`;
    const fromSha = await getDefaultBranchSha(octokit, GH_REPO, BASE);
    await createBranchFrom(octokit, GH_REPO, branch, fromSha);

    // Read file from base, update front-matter
    const { text: current, sha } = await getFileContent(octokit, GH_REPO, path, BASE);
    const parsed = matter(current);
  const fm: Record<string, unknown> = { ...parsed.data };

    fm.review_status = "approved";
    fm.publishedAt = new Date().toISOString(); // set publish timestamp

    // Keep ai_generated / citations as-is if present
    const nextContent = matter.stringify(parsed.content.trimStart() + "\n", fm);

    // Commit change on the branch
    await commitFile(
      octokit,
      GH_REPO,
      path,
      nextContent,
      `publish(${kind}): approve & publish ${slug}`,
      branch,
      sha
    );

    // Open PR
  const prTitle = `Publish: ${(doc as Insight | CaseStudy | Brief).title || slug}`;
    const prBody =
      `This PR auto-updates front-matter to:\n\n- \`review_status: approved\`\n- \`publishedAt: ${fm.publishedAt}\`\n\n` +
      `Kind: \`${kind}\`\nPath: \`${path}\``;

    const prUrl = await openPr(octokit, GH_REPO, branch, BASE, prTitle, prBody);

    return NextResponse.json({ success: true, ok: true, prUrl });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ success: false, ok: false, error: message }, { status: 500 });
  }
}
