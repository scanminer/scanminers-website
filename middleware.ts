import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, deriveAdminToken, validateAdminToken } from '@/lib/admin-auth';

const COOKIE_MAX_AGE = 60 * 60 * 12; // 12 hours

function buildCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/admin',
    maxAge: COOKIE_MAX_AGE,
  };
}

async function issueSessionResponse(resp: NextResponse, pass: string) {
  const token = await deriveAdminToken(pass);
  resp.cookies.set(ADMIN_COOKIE_NAME, token, buildCookieOptions());
  return resp;
}

function decodeBasicToken(encoded: string): string | null {
  try {
    if (typeof atob === 'function') {
      return atob(encoded);
    }
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(encoded, 'base64').toString('utf8');
    }
    return null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  const pass = process.env.ADMIN_PASS;
  if (!pass) return NextResponse.next();

  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const hasSession = await validateAdminToken(cookieToken, pass);

  // Allow the login page when not authenticated, but redirect if already logged in
  if (pathname.startsWith('/admin/login')) {
    if (hasSession) {
      const redirectTarget = req.nextUrl.searchParams.get('next') || '/admin';
      return NextResponse.redirect(new URL(redirectTarget, req.url));
    }
    return NextResponse.next();
  }

  if (hasSession) return NextResponse.next();

  // Support legacy Basic Auth headers for API clients
  const auth = req.headers.get('authorization') || '';
  if (auth.startsWith('Basic ')) {
    try {
      const decoded = decodeBasicToken(auth.slice(6));
      if (!decoded) throw new Error('Invalid basic token');
      const idx = decoded.indexOf(':');
      const p = decoded.slice(idx + 1);
      if (p === pass) {
        const resp = NextResponse.next();
        return issueSessionResponse(resp, pass);
      }
    } catch {
      // ignore malformed header
    }
  }

  const loginUrl = new URL('/admin/login', req.url);
  const nextPath = `${pathname}${search}`;
  loginUrl.searchParams.set('next', nextPath);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
