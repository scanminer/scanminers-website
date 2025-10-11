import { NextResponse, NextRequest } from 'next/server';

export const config = { matcher: ['/api/contact'] };

type Bucket = { n: number; t: number };
const BUCKET: Record<string, Bucket> = {};

export function middleware(req: NextRequest) {
  const ip =
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'anon';

  const now = Date.now();
  const b = (BUCKET[ip] ??= { n: 0, t: now });
  if (now - b.t > 60_000) {
    b.n = 0;
    b.t = now;
  }
  b.n += 1;
  if (b.n > 20) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  return NextResponse.next();
}
