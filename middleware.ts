import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function unauthorized(): NextResponse {
  const res = new NextResponse('Authentication required', { status: 401 });
  res.headers.set('WWW-Authenticate', 'Basic realm="Admin"');
  return res;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Only guard /admin, allow everything else
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  // Optional local bypass for development
  if (process.env.ALLOW_ADMIN_WITHOUT_AUTH === 'true') {
    return NextResponse.next();
  }

  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  // If not configured, allow access (no surprise lockouts in dev)
  if (!user || !pass) return NextResponse.next();

  const auth = req.headers.get('authorization') || '';
  if (auth.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.slice(6));
      const idx = decoded.indexOf(':');
      const u = decoded.slice(0, idx);
      const p = decoded.slice(idx + 1);
      if (u === user && p === pass) return NextResponse.next();
    } catch {
      // fallthrough to unauthorized
    }
  }
  return unauthorized();
}

export const config = {
  matcher: ['/admin/:path*'],
};
