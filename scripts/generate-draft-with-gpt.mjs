#!/usr/bin/env node
import fs from "fs";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import matter from "gray-matter";
import prettier from "prettier";
import { execSync } from "child_process";
import simpleGit from "simple-git";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readText(p) { return fs.readFileSync(p, "utf8"); }
function writeText(p, s) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); }

function mustEnv(name) {
  const v = process.env[name];
  if (!v) { console.error(`Missing env: ${name}`); process.exit(1); }
  return v;
}

const OPENAI_API_KEY = mustEnv("OPENAI_API_KEY");
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o"; // change if needed
const GH_TOKEN = mustEnv("GH_TOKEN");
const REPO = process.env.GITHUB_REPOSITORY || ""; // owner/repo
const BRIEF_FILE_PATH = process.env.BRIEF_FILE_PATH || process.argv[2];

if (!BRIEF_FILE_PATH) {
  console.error("Usage: node scripts/generate-draft-with-gpt.mjs <brief.md>");
  process.exit(1);
}

// 1) Read the Brief (Decap CMS file)
const briefRaw = readText(BRIEF_FILE_PATH);
const brief = matter(briefRaw);
const briefData = brief.data || {};
const briefBody = brief.content || "";

// 2) Build the user message (include brief context)
const systemMsg = readText(path.join(__dirname, "..", "prompts", "lidar_system_prompt.txt"));
const userMsg = readText(path.join(__dirname, "..", "prompts", "lidar_user_prompt.txt")) +
  "\n\nBrief frontmatter:\n" + yaml.dump(briefData) +
  "\n\nBrief body:\n" + briefBody;

// 3) Call OpenAI (with optional MOCK mode)
let payload;
const MOCK = process.env.GENERATOR_MOCK_JSON;
if (MOCK && fs.existsSync(MOCK)) {
  try {
    payload = JSON.parse(readText(MOCK));
    console.log(`Loaded mock payload from ${MOCK}`);
  } catch (e) {
    console.error("Failed to parse mock JSON:", e);
    process.exit(1);
  }
}

if (!payload) {
  const client = new OpenAI({ apiKey: OPENAI_API_KEY });
  let completion;
  try {
    completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: userMsg }
      ],
    });
  } catch (err) {
    console.error("OpenAI API error:", err?.response?.data || err.message || err);
    process.exit(1);
  }

  try {
    payload = JSON.parse(completion.choices[0].message.content);
  } catch (e) {
    console.error("Invalid JSON from model. Enable mock mode or retry.", e);
    process.exit(1);
  }
}

const { article_mdx, seo, figures, citations } = payload;
if (!article_mdx || !seo || !figures) {
  console.error("Missing required keys in model response.");
  process.exit(1);
}

// 4) Prepare paths
const slug = (briefData.slug || briefData.title || "lidar-tailings")
  .toLowerCase().replace(/[^a-z0-9-]/g, "-");
const articleDir = path.join("content", "insights", slug);
const imagesDir = path.join("public", "images", "generated", slug);
fs.mkdirSync(articleDir, { recursive: true });
fs.mkdirSync(imagesDir, { recursive: true });

// 5) Render figures
// Initialize MDX so we can append fallbacks/placeholders during rendering
let mdxOut = article_mdx || "";
for (const fig of figures) {
  try {
    if (fig.type === "mermaid") {
      // Render with Mermaid CLI
      const tmpMmd = path.join(imagesDir, `${fig.id}.mmd`);
      const outSvg = path.join(imagesDir, `${fig.id}.svg`);
      writeText(tmpMmd, fig.code);
      execSync(`npx --yes @mermaid-js/mermaid-cli -i "${tmpMmd}" -o "${outSvg}"`, { stdio: "inherit" });
    } else if (fig.type === "python") {
      // Run python to produce an SVG with the expected name
      const tmpPy = path.join(imagesDir, `${fig.id}.py`);
      writeText(tmpPy, fig.code + `\n# ensure output path`);
      // If no explicit savefig to .svg, append one
      if (!/savefig\(.+\.svg/.test(fig.code)) {
        fs.appendFileSync(tmpPy, `\nimport matplotlib.pyplot as plt\nplt.savefig("${path.join(imagesDir, fig.id + ".svg").replace(/\\/g, "/")}")\n`);
      }
      const env = { ...process.env };
      if (!env.MPLBACKEND) env.MPLBACKEND = "Agg"; // headless-safe
      execSync(`python3 "${tmpPy}"`, { stdio: "inherit", env });
    } else if (fig.type === "table") {
      // No render; will embed Markdown directly later
    }
  } catch (e) {
    console.error(`Figure render failed: ${fig.id}`, e);
    if (fig.type === "mermaid" && fig.code) {
      // Fallback to a Mermaid code block so client-side can render
      mdxOut += `\n\n\`\`\`mermaid\n${fig.code}\n\`\`\`\n`;
    } else {
      mdxOut += `\n\n> Figure \"${fig.id}\" failed to render. Please re-run locally.\n`;
    }
  }
}

// 6) Inject images into MDX (replace <!--FIG:id--> placeholders if present)
mdxOut = mdxOut.replace(/<!--FIG:([\w-]+)-->/g, (_m, id) =>
  `![${id}](\/images\/generated\/${slug}\/${id}.svg)`);

// If no placeholders, gently append figures at end:
const usedIds = [...article_mdx.matchAll(/<!--FIG:([\w-]+)-->/g)].map(m => m[1]);
for (const f of figures) {
  if ((f.type === "mermaid" || f.type === "python") && !usedIds.includes(f.id)) {
    mdxOut += `\n\n![${f.title || f.id}](\/images\/generated\/${slug}\/${f.id}.svg)\n`;
  }
  if (f.type === "table" && f.markdown) {
    mdxOut += `\n\n**${f.title || "Table"}**\n\n${f.markdown}\n`;
  }
}

// 7) Frontmatter + write MDX
const fm = {
  title: "Using LiDAR for Tailings Dam Monitoring",
  publishedAt: new Date().toISOString(),
  review_status: "needs-review",
  ai_generated: true,
  tags: ["LiDAR","TSF","GISTM","remote sensing","HSE"],
  seo,
  citations
};
const mdxWithFm = matter.stringify(mdxOut, fm);
const pretty = await prettier.format(mdxWithFm, { parser: "markdown" });
const articlePath = path.join(articleDir, "index.mdx");
writeText(articlePath, pretty);

// 8) Commit & PR
const git = simpleGit();
// create branch first to avoid touching main
const branch = `draft/lidar-${slug}-${Date.now()}`;
await git.checkoutLocalBranch(branch);
await git.add([articlePath, imagesDir]);
await git.commit(`feat(content): LiDAR TSF draft for ${slug}`);
await git.push("origin", branch);

const prTitle = `Draft: Using LiDAR for Tailings Dam Monitoring (${slug})`;
const prBody = `Auto-generated draft and figures from Brief: ${path.basename(BRIEF_FILE_PATH)}.\n- Figures rendered to /public/images/generated/${slug}\n- review_status: needs-review\n`;
const [owner, repo] = (REPO || "").split("/");

// minimal curl PR (avoids extra deps)
execSync(`curl -s -X POST -H "Authorization: token ${GH_TOKEN}" -H "Accept: application/vnd.github+json" https://api.github.com/repos/${owner}/${repo}/pulls -d '${JSON.stringify({ title: prTitle, head: branch, base: "main", body: prBody })}'`, { stdio: "inherit" });

console.log("Draft and PR created.");
