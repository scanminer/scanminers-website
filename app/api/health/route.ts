import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export function GET() {
  try {
    return NextResponse.json({ ok: true, rev: 'Rev F' })
  } catch {
    return new Response('ok', { status: 200 })
  }
}
