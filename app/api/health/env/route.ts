import { NextResponse } from "next/server";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Simple env presence check; never returns secret values
export async function GET() {
  const envObj: Record<string, string | undefined> = (typeof process !== 'undefined' && process.env) ? (process.env as Record<string, string | undefined>) : {};
  const present = (k: string) => typeof envObj[k] === 'string' && !!envObj[k];
  const data = {
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: present('NEXT_PUBLIC_TURNSTILE_SITE_KEY'),
    TURNSTILE_SECRET_KEY: present('TURNSTILE_SECRET_KEY'),
    RESEND_API_KEY: present('RESEND_API_KEY'),
    RESEND_FROM: present('RESEND_FROM'),
    RESEND_TO: present('RESEND_TO'),
    NEXT_PUBLIC_SITE_URL: present('NEXT_PUBLIC_SITE_URL'),
  } as const;

  const ok = Object.values(data).every(Boolean);
  return NextResponse.json({ ok, env: data });
}
