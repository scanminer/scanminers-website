import { NextResponse } from "next/server";
import { Resend } from "resend";
import React from "react";
import ContactFormEmail from "@/emails/contact-form-email";

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

    // Send email via Resend if configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not set; skipping email send.");
      return NextResponse.json({ success: true });
    }

    const resend = new Resend(resendApiKey);

    const from = process.env.RESEND_FROM || "contact@yourverifieddomain.com";
    const to = process.env.RESEND_TO || "you@example.com";
    const subject = "New Demo Request from Scanminers Website";

    // Render the React Email component directly; Resend supports passing a React element via `react` prop
    try {
      const { error: sendError } = await resend.emails.send({
        from,
        to,
        subject,
        react: React.createElement(ContactFormEmail, { name, email, company, message }),
      });
      if (sendError) {
        console.error("[CONTACT] Resend error", sendError);
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
