export const runtime = 'edge';

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function b64encode(str: string): string {
  // Edge runtime provides btoa
  return btoa(unescape(encodeURIComponent(str)));
}

function b64decode(str: string): string {
  return decodeURIComponent(escape(atob(str)));
}

export async function POST(req: Request) {
  try {
    const adminHeader = req.headers.get('x-admin-action-token') || '';
    const ADMIN_ACTION_TOKEN = process.env.ADMIN_ACTION_TOKEN || '';
    if (!ADMIN_ACTION_TOKEN) return new Response('Server not configured', { status: 500 });
    if (adminHeader !== ADMIN_ACTION_TOKEN) return new Response('Unauthorized', { status: 401 });

    const body = await req.json().catch(() => ({})) as { path?: string; branch?: string; title?: string };
    const path = body.path || '';
    if (!path || typeof path !== 'string') return new Response('Missing path', { status: 400 });
    const baseBranch = typeof body.branch === 'string' && /^(?:[A-Za-z0-9._\/-]{1,100})$/.test(body.branch) ? body.branch : 'main';

    const repoFull = process.env.GH_REPO || process.env.GITHUB_REPOSITORY || '';
    if (!repoFull.includes('/')) return new Response('Missing GH_REPO', { status: 500 });
    const [owner, repo] = repoFull.split('/');

    const GH_TOKEN = process.env.CONTENT_BOT_TOKEN || process.env.WORKFLOW_DISPATCH_TOKEN || '';
    if (!GH_TOKEN) return new Response('Server missing GitHub token', { status: 500 });

    // Helper for GitHub API calls
    const gh = async (endpoint: string, init?: RequestInit) => {
      const resp = await fetch(`https://api.github.com${endpoint}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${GH_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        ...init,
      });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`${resp.status} ${t}`);
      }
      return resp;
    };

    // 1) Get file content on base branch
    const fileResp = await gh(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(baseBranch)}`);
    const fileJson = await fileResp.json();
    const sha: string = fileJson.sha;
    const encoded: string = fileJson.content;
    const original = b64decode(encoded.replace(/\n/g, ''));

    // 2) Update review_status in frontmatter
    let updated = original;
    const replaced = updated.replace(/^(---[\s\S]*?\n)review_status:\s*['\"]?needs-review['\"]?(\s*)$/m, `$1review_status: approved$2`);
    if (replaced !== updated) {
      updated = replaced;
    } else if (/^---[\s\S]*?\n---/.test(updated)) {
      // Insert into existing frontmatter before closing ---
      updated = updated.replace(/^(---[\s\S]*?)\n---/, (m, p1) => `${p1}\nreview_status: approved\n---`);
    } else {
      return new Response('No frontmatter found to update', { status: 400 });
    }

    if (updated === original) return new Response('No change', { status: 400 });

    // 3) Create branch
    const refResp = await gh(`/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(baseBranch)}`);
    const refJson = await refResp.json();
    const baseSha: string = refJson.object.sha;
    const slugPart = path.split('/').pop()?.replace(/\.[^.]+$/, '') || 'post';
    const branchName = `approve/${slugPart}-${Date.now()}`;
    await gh(`/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: baseSha }),
    });

    // 4) Commit file to new branch
    await gh(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: `chore(admin): approve content ${slugPart}`,
        content: b64encode(updated),
        sha,
        branch: branchName,
      }),
    });

    // 5) Open PR
    const prTitle = body.title || `Approve content: ${slugPart}`;
    const prResp = await gh(`/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: prTitle, head: branchName, base: baseBranch, body: 'Approve via Admin UI' }),
    });
    const pr = await prResp.json();
    return json(202, { pr_url: pr.html_url });
  } catch (e: unknown) {
    let message = 'Unknown error';
    if (e instanceof Error) message = e.message;
    return json(500, { error: message });
  }
}
