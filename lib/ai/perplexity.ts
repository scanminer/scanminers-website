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
  const envModel = input.model || process.env.PERPLEXITY_MODEL;

  // Try to discover permitted models for this key; if it fails, fall back to static list.
  async function listModels(): Promise<string[]> {
    try {
      const endpoints = [
        "https://api.perplexity.ai/v1/models",
        "https://api.perplexity.ai/models",
      ];
      for (const url of endpoints) {
        const r = await fetch(url, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!r.ok) continue;
        const j = (await r.json()) as { data?: Array<{ id?: string }> };
        const ids = (j.data || []).map((m) => m.id!).filter(Boolean);
        if (ids.length) return ids;
      }
      return [];
    } catch {
      return [];
    }
  }

  const available = await listModels();
  const preference = [
    // Current official Sonar model IDs (per docs)
    "sonar-reasoning-pro",
    "sonar-reasoning",
    "sonar-pro",
    "sonar",
    "sonar-deep-research",
    // Older/alternative families
    "sonar-large-online",
    "sonar-medium-online",
    "sonar-small-online",
    "sonar-large-chat",
    "sonar-medium-chat",
    "sonar-small-chat",
    "sonar-large",
    "sonar-medium",
    "sonar-small",
  ];

  const discovered = available.length
    ? preference.filter((m) => available.includes(m))
    : [];

  const candidates = Array.from(
    new Set(
      [
        envModel,
        ...discovered,
        // Static safety net (in case /models endpoint is unavailable)
        ...preference,
        // Older naming kept last as a final fallback
        "llama-3.1-sonar-large-128k-online",
      ].filter(Boolean) as string[]
    )
  );

  let lastErrorText = "";
  let data: unknown;
  // Helpful debug in dev to see what we'll try
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[perplexity] Candidate models: ${candidates.join(", ")}`);
  }
  for (const model of candidates) {
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

    if (r.ok) {
      data = await r.json();
      break;
    } else {
      const t = await r.text().catch(() => "");
      lastErrorText = `Perplexity error ${r.status}: ${t}`;
      // If invalid model (or not found), try next candidate
      if (
        (r.status === 400 && /invalid_model|Invalid model/i.test(t)) ||
        (r.status === 404 && /model|not\s*found/i.test(t)) ||
        (r.status === 422 && /model|unsupported/i.test(t))
      ) {
        console.warn(`[perplexity] Model '${model}' invalid, trying next fallback...`);
        continue;
      }
      throw new Error(lastErrorText);
    }
  }

  if (!data) {
    throw new Error(
      (lastErrorText || "Perplexity request failed (no valid model)") +
        ` | tried models: ${candidates.join(", ")}`
    );
  }

  // Narrow minimal shape for reading message content
  const resp = data as {
    choices?: Array<{ message?: { content?: string }; text?: string }>;
  };
  const text = resp?.choices?.[0]?.message?.content ?? resp?.choices?.[0]?.text ?? "";

  // Strip code fences if present
  let cleaned = text.replace(/^```(json)?/i, "").replace(/```$/i, "").trim();

  // Sanitize common JSON-breaking artifacts from LLMs
  // - Replace smart quotes with straight quotes
  // - Remove zero-width and BOM
  // - Replace ASCII control chars (including raw newlines in strings) with spaces
  cleaned = cleaned
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, " ");

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Try to recover by extracting the first top-level JSON object
    const match = cleaned.match(/\{[\s\S]*\}$/);
    if (!match) throw new Error("Model did not return valid JSON");
    const candidate = match[0]
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
      .replace(/[\u0000-\u001F\u007F]/g, " ");
    parsed = JSON.parse(candidate);
  }

  const draft = DraftSchema.parse(parsed);
  return draft;
}

export function toFrontmatterMDX(
  d: DraftJSON
): string {
  // Convert structured citations to simple strings for rendering
  const citationStrings = Array.isArray(d.citations)
    ? d.citations.map((c) => {
        const title = c.title?.trim();
        const url = c.url.trim();
        const note = c.note?.trim();
        return [title, url, note].filter(Boolean).join(" — ");
      })
    : [];

  // Drafts must include a valid date for Contentlayer; use today's date
  const today = new Date().toISOString().slice(0, 10);

  const fm = [
    "---",
    `title: ${JSON.stringify(d.title)}`,
    `summary: ${JSON.stringify(d.summary)}`,
    `tags: ${JSON.stringify(d.tags)}`,
    `citations: ${JSON.stringify(citationStrings)}`,
    `review_status: "needs-review"`,
    `ai_generated: true`,
    `publishedAt: ${today}`,
    "---",
    "",
  ].join("\n");

  return fm + d.body.trim() + "\n";
}

// Lightweight improver: returns ONLY the improved MDX body (no frontmatter)
export async function improveMdxBodyWithPerplexity(input: {
  body: string;
  prompt: string; // editor instructions, e.g., "tighten intro, add tags list section"
  type: "insight" | "case" | "brief";
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const apiKey = process.env.PERPLEXITY_KEY;
  if (!apiKey) throw new Error("Missing PERPLEXITY_KEY");

  function editSystemPrompt(t: "insight" | "case" | "brief") {
    return [
      "You are editing MDX article content for a geoscience/mining tech website.",
      "Return ONLY the revised MDX body (no YAML frontmatter, no JSON, no commentary, no code fences).",
      "Keep headings hierarchy consistent (h2/h3), prefer concise paragraphs and lists.",
      `Target kind: ${t}. Preserve factual correctness. If adding facts, keep them general unless widely accepted.`,
    ].join(" ");
  }

  // Reuse discovery from generateDraftWithPerplexity by making a tiny local helper
  async function listModels(): Promise<string[]> {
    try {
      const endpoints = [
        "https://api.perplexity.ai/v1/models",
        "https://api.perplexity.ai/models",
      ];
      for (const url of endpoints) {
        const r = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
        if (!r.ok) continue;
        const j = (await r.json()) as { data?: Array<{ id?: string }> };
        const ids = (j.data || []).map((m) => m.id!).filter(Boolean);
        if (ids.length) return ids;
      }
      return [];
    } catch {
      return [];
    }
  }

  const envModel = input.model || process.env.PERPLEXITY_MODEL;
  const available = await listModels();
  const preference = [
    "sonar-reasoning-pro",
    "sonar-reasoning",
    "sonar-pro",
    "sonar",
    "sonar-deep-research",
    "sonar-large-online",
    "sonar-medium-online",
    "sonar-small-online",
    "sonar-large-chat",
    "sonar-medium-chat",
    "sonar-small-chat",
    "sonar-large",
    "sonar-medium",
    "sonar-small",
  ];
  const discovered = available.length ? preference.filter((m) => available.includes(m)) : [];
  const candidates = Array.from(new Set([envModel, ...discovered, ...preference, "llama-3.1-sonar-large-128k-online"].filter(Boolean) as string[]));

  let lastError = "";
  for (const model of candidates) {
    const r = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        temperature: input.temperature ?? 0.3,
        max_tokens: input.maxTokens ?? 1800,
        messages: [
          { role: "system", content: editSystemPrompt(input.type) },
          {
            role: "user",
            content: [
              "INSTRUCTIONS:",
              input.prompt.trim(),
              "",
              "CURRENT_MDX_BODY:",
              input.body,
              "",
              "Return only the full revised MDX BODY (no frontmatter).",
            ].join("\n"),
          },
        ],
      }),
    });
    if (r.ok) {
      const data = (await r.json()) as { choices?: Array<{ message?: { content?: string }; text?: string }>; };
      let text = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? "";
      text = text
        .replace(/^```(mdx|markdown)?/i, "")
        .replace(/```$/i, "")
        .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "") // zero-width
        .trim();
      return text;
    } else {
      const t = await r.text().catch(() => "");
      lastError = `Perplexity error ${r.status}: ${t}`;
      if (
        (r.status === 400 && /invalid_model|Invalid model/i.test(t)) ||
        (r.status === 404 && /model|not\s*found/i.test(t)) ||
        (r.status === 422 && /model|unsupported/i.test(t))
      ) {
        continue; // try next model
      }
      throw new Error(lastError);
    }
  }

  throw new Error(lastError || "Perplexity request failed (no valid model)");
}
