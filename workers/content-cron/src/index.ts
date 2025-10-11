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

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(`Cron job triggered: ${controller.cron}`);
    const topic = 'Weekly Update: Advancements in Satellite-based Mineral Prospectivity';
    ctx.waitUntil(runContentWorkflow(env, topic));
  },
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    console.log('Manual trigger received.');
    const url = new URL(request.url);
    const topic = url.searchParams.get('topic');
    if (!topic) return new Response('Missing "topic" query parameter.', { status: 400 });
    return runContentWorkflow(env, topic);
  },
};
