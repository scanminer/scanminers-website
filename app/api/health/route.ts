export const runtime = 'edge';

export function GET() {
  return new Response(JSON.stringify({ ok: true, rev: 'Rev E' }), {
    headers: { 'content-type': 'application/json' },
  });
}
