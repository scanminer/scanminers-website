import { NextResponse } from "next/server";
export const runtime = 'edge';

type Payload = {
  name?: string;
  email?: string;
  company?: string;
  message?: string;
  token?: string;
};

type TurnstileVerification = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;
    const { name, email, company, message, token } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }
    if (!token) {
      return NextResponse.json({ success: false, message: "Missing Turnstile token" }, { status: 400 });
    }

    // Verify the Turnstile token with Cloudflare
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      console.warn("TURNSTILE_SECRET_KEY not set; skipping verification.");
    }

  let verification: TurnstileVerification | null = null;
    if (secret) {
      const params = new URLSearchParams();
      params.append("secret", secret);
      params.append("response", token);
      // Optionally, you may send the IP address if available from headers
      // const ip = req.headers.get("x-forwarded-for")?.split(",")[0];
      // if (ip) params.append("remoteip", ip);

      const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });
  verification = (await resp.json()) as TurnstileVerification;
    }

    // Log the submission and verification result for now
    console.log("[CONTACT] Submission", {
      name,
      email,
      company,
      message: message?.slice(0, 1000),
    });
    console.log("[CONTACT] Turnstile verification", verification ?? { skipped: true });

    if (verification && verification.success === false) {
      return NextResponse.json({ success: false, message: "Failed Turnstile verification" }, { status: 400 });
    }

    // Send email via Resend REST API (Edge-friendly)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not set; skipping email send.");
      return NextResponse.json({ success: true });
    }

  const from = process.env.RESEND_FROM || "contact@scanminers.com";
    const toEnv = process.env.RESEND_TO || "you@example.com";
    const to = toEnv.includes(",") ? toEnv.split(",").map((s) => s.trim()).filter(Boolean) : toEnv;
    const subject = "New Demo Request from Scanminers Website";

    const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[ch] as string));

    const html = `<!doctype html>
      <html><body style="font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#111;">
        <h1 style="font-size:18px;">New Demo Request</h1>
        <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;max-width:640px;width:100%">
          <tr><td style="background:#f5f5f5;width:160px;font-weight:600;vertical-align:top;">Name</td><td>${escapeHtml(name)}</td></tr>
          <tr><td style="background:#f5f5f5;width:160px;font-weight:600;vertical-align:top;">Email</td><td>${escapeHtml(email)}</td></tr>
          ${company ? `<tr><td style="background:#f5f5f5;width:160px;font-weight:600;vertical-align:top;">Company</td><td>${escapeHtml(company)}</td></tr>` : ""}
          <tr><td style="background:#f5f5f5;width:160px;font-weight:600;vertical-align:top;">Message</td><td><div style="white-space:pre-wrap;line-height:1.5">${escapeHtml(message)}</div></td></tr>
        </table>
        <p style="font-size:12px;color:#555;margin-top:16px;">Sent from the Scanminers website contact form.</p>
      </body></html>`;

    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to, subject, html, reply_to: email }),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        console.error("[CONTACT] Resend API error", resp.status, errText);
        return NextResponse.json({ success: false, message: "Failed to send email" }, { status: 500 });
      }
    } catch (sendErr) {
      console.error("[CONTACT] Exception sending email", sendErr);
      return NextResponse.json({ success: false, message: "Error sending email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[CONTACT] Error handling submission", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
