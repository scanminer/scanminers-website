// workers/content-cron/src/index.ts

import { GitHubClient } from './github';
import { generateContent } from './content-generator';

export interface Env {
  GH_TOKEN: string;
  PERPLEXITY_KEY: string;
  GH_REPO: string;
  PERPLEXITY_MODEL?: string;
}

// Local type shims for CF runtime to satisfy TS without installing @cloudflare/workers-types
type ScheduledController = { cron: string };
type ExecutionContext = { waitUntil(promise: Promise<unknown>): void };

async function runContentWorkflow(env: Env, topic: string): Promise<Response> {
  console.log('Starting content workflow...');
  const github = new GitHubClient(env);

  // 1. Define topic and paths (topic is a required argument)
  if (!topic || topic.trim().length < 5) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid topic provided.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  topic = topic.trim();
  const date = new Date().toISOString().slice(0, 10);
  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50);
  let branchName = `content/draft-${slug}`;
  const filePath = `content/insights/${slug}.mdx`;
  const commitMessage = `feat(content): add draft for '${topic}'`;
  const prTitle = `[Content] Draft: ${topic}`;
  const prBody = `This is an AI-generated draft for a new insight.

Please review for:
- [ ] Factual accuracy and citations
- [ ] Tone and style alignment
- [ ] Technical correctness

Once approved, set \`review_status: approved\` and merge.`;

  try {
    // 2. Generate content from Perplexity
    console.log(`Generating content for topic: ${topic}`);
    const researchBrief = await generateContent(env, topic);

    // 3. Format MDX file contents (keeps schema requirements satisfied)
    const mdxContent = `---
title: "${topic}"
summary: "A brief summary of the key findings will go here. Please update."
publishedAt: "${date}"
review_status: "needs-review"
ai_generated: true
tags: ["AI", "Mining", "Maintenance"]
---

${researchBrief}
`;

    // 4. Create branch, commit file, and open PR
  console.log('Getting main branch SHA...');
    const mainSha = await github.getMainBranchSha();

    // Ensure unique branch name if already exists
    if (await github.branchExists(branchName)) {
      const stamp = Math.floor(Date.now() / 1000);
      branchName = `${branchName}-${stamp}`;
    }
    console.log(`Creating branch: ${branchName}`);
    await github.createBranch(branchName, mainSha);

    console.log(`Creating commit in ${branchName} for file: ${filePath}`);
    await github.createCommitAndPush(branchName, filePath, mdxContent, commitMessage);

    console.log('Creating pull request...');
    const prUrl = await github.createPullRequest(branchName, prTitle, prBody);

    console.log(`Successfully created PR: ${prUrl}`);
    return new Response(JSON.stringify({ success: true, pull_request_url: prUrl }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const err = e as Error;
    console.error('Content workflow failed:', err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function extractFrontmatter(content: string): Record<string, string> {
  // Very lightweight YAML frontmatter extractor for a few keys
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const result: Record<string, string> = {};
  if (!fmMatch) return result;
  const lines = fmMatch[1].split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (m) {
      const key = m[1].trim();
      // strip surrounding quotes if present
      let value = m[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      result[key] = value;
    }
  }
  return result;
}

async function processScheduledPublishes(env: Env): Promise<{ merged: number; checked: number }> {
  const github = new GitHubClient(env);
  const openPRs = await github.listOpenPulls();
  const now = new Date();

  let merged = 0;
  let checked = 0;

  for (const pr of openPRs) {
    // Only consider our content PRs targeting main
    if ((pr.base?.ref ?? '') !== 'main') continue;
  const files = await github.getPullFiles(pr.number);
    // Look for content files we manage
  const contentFiles = files.filter((f: { filename: string }) => /^(content\/(insights|case-studies)\/).+\.(md|mdx)$/i.test(f.filename));
    if (contentFiles.length === 0) continue;
    checked++;

    // Read frontmatter from the first content file in the PR
    const headSha = pr.head?.sha as string;
    let shouldMerge = false;
    for (const file of contentFiles) {
      const raw = await github.getFileContentAtRef(file.filename, headSha);
      const fm = extractFrontmatter(raw);
      const publishedAt = fm.publishedAt || fm.published_at || fm.publishAt;
      const reviewStatus = (fm.review_status || '').toLowerCase();
      if (!publishedAt) continue;
      const when = new Date(publishedAt);
      if (isNaN(when.getTime())) continue;
      if (reviewStatus !== 'approved') continue; // require human approval gate
      if (when <= now) {
        shouldMerge = true;
        break;
      }
    }

    if (shouldMerge) {
      // Try to merge; if branch protection prevents it, the API will error out
      try {
        await github.mergePullRequest(pr.number, `Auto-publish: ${pr.title}`);
        merged++;
      } catch (e) {
        console.error(`Failed to merge PR #${pr.number}:`, (e as Error).message);
      }
    }
  }

  return { merged, checked };
}

const handlers = {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(`Cron job triggered: ${controller.cron}`);
    const topic = 'Weekly Update: Advancements in Satellite-based Mineral Prospectivity';
    ctx.waitUntil(runContentWorkflow(env, topic));
    ctx.waitUntil(processScheduledPublishes(env).then(({ merged, checked }) => {
      console.log(`Scheduled publish check: merged=${merged}, checked=${checked}`);
    }));
  },
  async fetch(request: Request, env: Env): Promise<Response> {
    console.log('Manual trigger received.');
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    if (action === 'publish_due') {
      const result = await processScheduledPublishes(env);
      return new Response(JSON.stringify({ success: true, ...result }), { headers: { 'Content-Type': 'application/json' } });
    }
    const topic = url.searchParams.get('topic');
    if (!topic) return new Response('Missing "topic" query parameter.', { status: 400 });
    return runContentWorkflow(env, topic);
  },
};

export default handlers;
