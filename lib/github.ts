import { Octokit } from "@octokit/rest";

export function getOctokit() {
  const token = process.env.CONTENT_BOT_TOKEN;
  if (!token) throw new Error("Missing CONTENT_BOT_TOKEN");
  return new Octokit({ auth: token });
}

export async function createContentPR(opts: {
  repo: string; // "owner/name"
  base?: string; // default main
  branchName: string; // e.g. draft/insight-lithium-brines-YYYYMMDD
  path: string; // content/insights/my-post.mdx
  content: string; // full MDX
  commitMessage: string; // e.g. "chore(content): add draft insight"
  title: string; // PR title
  body?: string; // PR body
}) {
  const [owner, repo] = opts.repo.split("/");
  const base = opts.base || process.env.GIT_DEFAULT_BRANCH || "main";
  const octokit = getOctokit();

  // Get base sha
  const { data: baseRef } = await octokit.git.getRef({ owner, repo, ref: `heads/${base}` });

  // Create branch
  await octokit.git.createRef({ owner, repo, ref: `refs/heads/${opts.branchName}`, sha: baseRef.object.sha });

  // Put file
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: opts.path,
    branch: opts.branchName,
    message: opts.commitMessage,
    content: Buffer.from(opts.content, "utf8").toString("base64"),
  });

  // Open PR
  const pr = await octokit.pulls.create({ owner, repo, head: opts.branchName, base, title: opts.title, body: opts.body || "" });
  return pr.data.html_url;
}
