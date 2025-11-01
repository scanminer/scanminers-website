// app/api/admin/generate-draft/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateDraftWithPerplexity, toFrontmatterMDX } from "../../../../lib/ai/perplexity";
import { createContentPR } from "../../../../lib/github";

export const runtime = "edge";

const Body = z.object({
  topic: z.string().min(4),
  context: z.string().optional(),
  type: z.enum(["insight", "case", "brief"]).default("insight"),
  createPR: z.boolean().default(false),
});

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "").slice(0, 80);
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { topic, context, type, createPR } = Body.parse(json);

    const draft = await generateDraftWithPerplexity({ topic, context, type });
    const slug = `${slugify(draft.title || topic)}`;
  const mdx = toFrontmatterMDX(draft);

    if (createPR) {
      const repo = process.env.GH_REPO || process.env.CONTENT_REPO;
      const token = process.env.CONTENT_BOT_TOKEN;
      if (!repo || !token) {
        return NextResponse.json(
          { ok: false, error: "Missing GH_REPO/CONTENT_REPO or CONTENT_BOT_TOKEN for PR creation.", mdx },
          { status: 400 }
        );
      }

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const branch = `draft/${type}-${slug}-${dateStr}`;
      const pathMap = {
        insight: `content/insights/${slug}.mdx`,
        case: `content/case-studies/${slug}.mdx`,
        brief: `content/briefs/${slug}.md`,
      } as const;
      const path = pathMap[type];

      const prUrl = await createContentPR({
        repo,
        branchName: branch,
        path,
        content: mdx,
        commitMessage: `chore(content): add ${type} draft — ${draft.title}`,
        title: `Content draft: ${draft.title} (${type})`,
        body: [
          `Auto-generated draft for **${type}**.`,
          "",
          `Topic: ${topic}`,
          context ? `Context: ${context}` : "",
          "",
          "Editors: set `review_status: approved` and a real `publishedAt` when ready.",
        ].join("\n"),
      });

      return NextResponse.json({ ok: true, mode: "pr", prUrl, path, mdx });
    }

    return NextResponse.json({ ok: true, mode: "preview", mdx });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
