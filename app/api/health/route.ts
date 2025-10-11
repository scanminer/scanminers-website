export const runtime = 'edge';

export function GET() {
  try {
    return new Response(JSON.stringify({ ok: true, rev: 'Rev E' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch {
    return new Response('ok', { status: 200 });
  }
}
