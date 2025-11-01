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

// Phase 3 helpers
export function makeOctokit(token: string) {
  return new Octokit({ auth: token, userAgent: "scanminers-admin/phase3" });
}

export async function getDefaultBranchSha(octokit: Octokit, repo: string, defaultBranch: string) {
  const [owner, r] = repo.split("/");
  const { data: ref } = await octokit.git.getRef({ owner, repo: r, ref: `heads/${defaultBranch}` });
  return ref.object.sha as string;
}

export async function createBranchFrom(
  octokit: Octokit,
  repo: string,
  newBranch: string,
  fromSha: string
) {
  const [owner, r] = repo.split("/");
  await octokit.git.createRef({ owner, repo: r, ref: `refs/heads/${newBranch}`, sha: fromSha });
}

export async function getFileContent(octokit: Octokit, repo: string, path: string, ref: string) {
  const [owner, r] = repo.split("/");
  const res = await octokit.repos.getContent({ owner, repo: r, path, ref });
  // Narrow type to file response shape
  const data = res.data as unknown as { content?: string; sha?: string };
  if (!data.content) throw new Error(`Path is not a file: ${path}`);
  const buff = Buffer.from(data.content, "base64");
  return { text: buff.toString("utf8"), sha: (data.sha || "") as string };
}

export async function commitFile(
  octokit: Octokit,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string,
  sha?: string
) {
  const [owner, r] = repo.split("/");
  const encoded = Buffer.from(content, "utf8").toString("base64");
  const { data } = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo: r,
    path,
    message,
    content: encoded,
    branch,
    sha,
  });
  return data;
}

export async function openPr(
  octokit: Octokit,
  repo: string,
  head: string,
  base: string,
  title: string,
  body?: string
) {
  const [owner, r] = repo.split("/");
  const { data } = await octokit.pulls.create({ owner, repo: r, head, base, title, body });
  return data.html_url;
}
