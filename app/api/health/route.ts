export const dynamic = 'force-dynamic'

export function GET() {
  try {
    const body = JSON.stringify({ ok: true, rev: 'Rev G' })
    return new Response(body, { status: 200, headers: { 'content-type': 'application/json' } })
  } catch {
    return new Response('ok', { status: 200 })
  }
}
