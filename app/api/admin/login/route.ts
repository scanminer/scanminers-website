import { NextResponse } from "next/server";
import { deriveAdminToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

const COOKIE_MAX_AGE = 60 * 60 * 12; // 12 hours

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: COOKIE_MAX_AGE,
  };
}

export async function POST(request: Request) {
  const envPass = process.env.ADMIN_PASS;
  if (!envPass) {
    return NextResponse.json({ success: false, ok: false, error: "Admin password is not configured." }, { status: 500 });
  }

  type LoginBody = { password?: string };
  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const password = typeof body.password === "string" ? body.password : "";

  if (!password) {
    return NextResponse.json({ success: false, ok: false, error: "Password is required." }, { status: 400 });
  }

  if (password !== envPass) {
    return NextResponse.json({ success: false, ok: false, error: "Invalid password." }, { status: 401 });
  }

  const token = await deriveAdminToken(envPass);
  const res = NextResponse.json({ success: true, ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, cookieOptions());
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, "", { ...cookieOptions(), maxAge: 0 });
  return res;
}
