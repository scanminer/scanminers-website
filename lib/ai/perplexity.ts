import { z } from "zod";

const DraftSchema = z.object({
  title: z.string().min(4),
  summary: z.string().min(20),
  tags: z.array(z.string()).default([]),
  citations: z
    .array(
      z.object({
        title: z.string().optional(),
        url: z.string().url(),
        note: z.string().optional(),
      })
    )
    .default([]),
  body: z.string().min(200), // MDX (no frontmatter)
});

export type DraftJSON = z.infer<typeof DraftSchema>;

function systemPrompt(type: "insight" | "case" | "brief") {
  return [
    "You are generating MDX content for a geoscience + mining tech website.",
    "Return STRICT JSON only, matching the schema: {title, summary, tags[], citations[{url,title?,note?}], body}.",
    "Body must be MDX (no frontmatter). Prefer short paragraphs, bullet lists, and h3/h4 sectioning.",
    "Every factual claim that could be challenged should be anchored with at least one credible source in `citations`.",
    `Tone: expert but readable. Target: ${type}.`,
  ].join(" ");
}

export async function generateDraftWithPerplexity(input: {
  topic: string;
  context?: string;
  type: "insight" | "case" | "brief";
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<DraftJSON> {
  const apiKey = process.env.PERPLEXITY_KEY;
  if (!apiKey) throw new Error("Missing PERPLEXITY_KEY");

  const model =
    input.model || process.env.PERPLEXITY_MODEL || "llama-3.1-sonar-large-128k-online";

  const r = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: input.temperature ?? 0.3,
      max_tokens: input.maxTokens ?? 2000,
      messages: [
        { role: "system", content: systemPrompt(input.type) },
        {
          role: "user",
          content: [
            `TOPIC: ${input.topic}`,
            input.context ? `CONTEXT: ${input.context}` : "",
            "",
            "Return JSON ONLY. Do not include code fences or commentary.",
          ].join("\n"),
        },
      ],
    }),
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Perplexity error ${r.status}: ${t}`);
  }

  const data = await r.json();
  const text = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? "";

  // Strip code fences if present
  const cleaned = text.replace(/^```(json)?/i, "").replace(/```$/i, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}$/);
    if (!match) throw new Error("Model did not return valid JSON");
    parsed = JSON.parse(match[0]);
  }

  const draft = DraftSchema.parse(parsed);
  return draft;
}

export function toFrontmatterMDX(
  d: DraftJSON,
  meta: {
    type: "insight" | "case" | "brief";
    slug?: string;
  }
): string {
  const fm = [
    "---",
    `title: ${JSON.stringify(d.title)}`,
    `summary: ${JSON.stringify(d.summary)}`,
    `tags: ${JSON.stringify(d.tags)}`,
    `citations: ${JSON.stringify(d.citations)}`,
    `review_status: "needs-review"`,
    `ai_generated: true`,
    `publishedAt: null`,
    `type: ${meta.type}`,
    "---",
    "",
  ].join("\n");

  return fm + d.body.trim() + "\n";
}
