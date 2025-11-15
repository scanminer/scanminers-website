import type { NextRequest } from "next/server";

export async function verifyTurnstileToken(token: string | null | undefined, req: NextRequest): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("TURNSTILE_SECRET_KEY is not configured. Turnstile verification skipped.");
    return true;
  }

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
  if (ip) formData.append("remoteip", ip);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });
    const outcome = (await response.json()) as { success?: boolean };
    return Boolean(outcome.success);
  } catch (error) {
    console.error("[turnstile] verification failed", error);
    return false;
  }
}
