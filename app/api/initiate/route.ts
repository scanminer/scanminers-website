import { NextResponse } from "next/server";

// Edge-compatible INITIATE endpoint: disabled in production and Pages.
// Use /api/initiate-local for dev (nodejs runtime) to actually create files.
export const runtime = "edge";
export const revalidate = 0; // avoid caching; ensure fresh response

export async function POST() {
  try {
    // Always disabled on Edge (Cloudflare Pages). Use /api/initiate-local in dev.
    return NextResponse.json(
      { ok: false, error: "Initiate API is disabled on Edge runtime. Use /admin/initiate locally (dev) or trigger the generator Action." },
      { status: 403 }
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Invalid input";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
