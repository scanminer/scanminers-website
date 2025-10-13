export const runtime = 'edge';

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function cors(req: Request, res: ResponseInit = {}) {
  const origin = new URL(req.url).origin;
  return {
    ...res,
    headers: {
      'access-control-allow-origin': origin,
      'access-control-allow-headers': 'content-type,x-admin-action-token',
      'access-control-allow-methods': 'OPTIONS,POST',
      ...(res.headers || {}),
    } as Record<string, string>,
  } as ResponseInit;
}

export async function OPTIONS(req: Request) {
  return new Response(null, cors(req, { status: 204 }));
}

export async function POST(req: Request) {
  try {
    const adminHeader = req.headers.get('x-admin-action-token') || '';
    const ADMIN_ACTION_TOKEN = process.env.ADMIN_ACTION_TOKEN || '';
    if (!ADMIN_ACTION_TOKEN) return new Response('Server not configured', { status: 500 });
    if (adminHeader !== ADMIN_ACTION_TOKEN) return new Response('Unauthorized', { status: 401 });

    const { slug, prompt } = await req.json().catch(() => ({}));
    if (!slug || typeof slug !== 'string' || !/^[a-z0-9-]{1,100}$/.test(slug)) {
      return new Response('Invalid slug', { status: 400 });
    }

    const repoFull = process.env.GITHUB_REPOSITORY || 'scanminer/scanminers-website';
    const [owner, repo] = repoFull.split('/');
    const WORKFLOW_DISPATCH_TOKEN = process.env.WORKFLOW_DISPATCH_TOKEN || process.env.CONTENT_BOT_TOKEN || '';
    if (!WORKFLOW_DISPATCH_TOKEN) return new Response('Server missing dispatch token', { status: 500 });

    const ghResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/regenerate-image.yml/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WORKFLOW_DISPATCH_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          post_slug: slug,
          ...(prompt ? { prompt } : {}),
        },
      }),
    });

    if (!ghResp.ok) {
      const txt = await ghResp.text();
      return new Response(`GitHub error: ${ghResp.status} ${txt}`, { status: 502 });
    }

    return new Response(null, cors(req, { status: 202 }));
  } catch (e: any) {
    return json(500, { error: String(e?.message || e) });
  }
}
