// app/api/admin/new-content/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createContentPR } from "@/lib/github";

export const runtime = "edge";

const Body = z.object({
  type: z.enum(["insight", "case", "brief"]).default("insight"),
  title: z.string().min(4),
  summary: z.string().min(50).max(300).optional(), // required for insight/case
  tags: z.array(z.string()).optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  slug: z.string().min(2).max(80).optional(),
  createPR: z.boolean().default(true),
});

function normalizeSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

function fmForInsightOrCase(input: z.infer<typeof Body> & { kind: "insight" | "case" }) {
  const today = new Date().toISOString().slice(0, 10);
  const tags = input.tags && input.tags.length ? input.tags : [];
  const fmLines = [
    "---",
    `title: ${JSON.stringify(input.title)}`,
    `summary: ${JSON.stringify(input.summary || "Summary TBD — please edit before publishing.")}`,
    `tags: ${JSON.stringify(tags)}`,
    `review_status: "needs-review"`,
    `ai_generated: false`,
    input.image ? `image: ${JSON.stringify(input.image)}` : undefined,
    input.imageAlt ? `imageAlt: ${JSON.stringify(input.imageAlt)}` : undefined,
    `publishedAt: ${today}`,
    "---",
    "",
    "<!-- Write your content below. Use MDX headings, lists, and short paragraphs. -->",
    "",
    "## Introduction",
    "",
    "(Your intro goes here.)",
    "",
    "## Main sections",
    "",
    "- Key point 1",
    "- Key point 2",
    "- Key point 3",
    "",
  ].filter(Boolean) as string[];
  return fmLines.join("\n") + "\n";
}

function fmForBrief(input: z.infer<typeof Body>) {
  const lines = [
    "---",
    input.title ? `title: ${JSON.stringify(input.title)}` : undefined,
    input.summary ? `context: ${JSON.stringify(input.summary)}` : undefined,
    `status: ${JSON.stringify("New Brief")}`,
    "---",
    "",
    "(Add notes/context for this brief. The content cron may generate a draft.)",
    "",
  ].filter(Boolean) as string[];
  return lines.join("\n") + "\n";
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const input = Body.parse(json);

    const repo = process.env.GH_REPO || process.env.CONTENT_REPO;
    const token = process.env.CONTENT_BOT_TOKEN;
    if (!repo || !token) {
      return NextResponse.json(
        { ok: false, error: "Missing GH_REPO/CONTENT_REPO or CONTENT_BOT_TOKEN for PR creation." },
        { status: 400 }
      );
    }

    const slug = normalizeSlug(input.slug || input.title);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const branch = `new/${input.type}-${slug}-${dateStr}`;

    const pathMap = {
      insight: `content/insights/${slug}.mdx`,
      case: `content/case-studies/${slug}.mdx`,
      brief: `content/briefs/${slug}.md`,
    } as const;
    const path = pathMap[input.type];

    const content = input.type === "brief"
      ? fmForBrief(input)
      : fmForInsightOrCase({ ...input, kind: input.type as "insight" | "case" });

    const prUrl = await createContentPR({
      repo,
      branchName: branch,
      path,
      content,
      commitMessage: `chore(content): new ${input.type} scaffold — ${input.title}`,
      title: `New ${input.type}: ${input.title}`,
      body: [
        `This PR adds a scaffold for a ${input.type}.`,
        "",
        `Path: \`${path}\``,
        input.summary ? `Summary: ${input.summary}` : undefined,
      ].filter(Boolean).join("\n"),
    });

  return NextResponse.json({ ok: true, prUrl, path, slug, branch });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
