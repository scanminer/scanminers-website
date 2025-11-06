export const runtime = 'edge';

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function POST(req: Request) {
  const enabled = process.env.ENABLE_INITIATE_API === 'true';
  if (!enabled) {
    return json(403, { error: 'Initiate API is disabled in this environment.' });
  }
  try {
    const data = (await req.json()) as { title?: string; summary?: string } | undefined;
    const title = (data?.title || '').trim();
    if (!title) return json(400, { error: 'Missing title' });
    // Dev-only demo: pretend we created a draft and return a slug.
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    return json(200, { message: 'Draft initiated (dev-only).', slug });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unexpected error';
    return json(500, { error: msg });
  }
}

export async function GET() {
  return json(200, { ok: true, enabled: process.env.ENABLE_INITIATE_API === 'true' });
}
