import { NextResponse } from "next/server";

const LEGACY_MESSAGE = "Password logins have been replaced by GitHub SSO via NextAuth.";

export async function POST() {
  return NextResponse.json({ success: false, ok: false, error: LEGACY_MESSAGE }, { status: 410 });
}

export async function DELETE() {
  return NextResponse.json({ success: false, ok: false, error: LEGACY_MESSAGE }, { status: 410 });
}
