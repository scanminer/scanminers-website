import { type NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limiter";
import { createLead } from "@/lib/lead-store";
import { sendEmail } from "@/lib/resend";

async function createGitHubIssue(formData: {
  name: string;
  email: string;
  company?: string;
  message: string;
}) {
  const token = process.env.GH_TOKEN;
  const repo =
    process.env.NEXT_PUBLIC_GH_REPO || "moodyguyhub/scanminers-website";

  if (!token) {
    console.warn("GH_TOKEN is not set. Skipping GitHub issue creation.");
    return;
  }

  const issueBody = `
**New Lead Submission**

- **Name:** ${formData.name}
- **Email:** ${formData.email}
- **Company:** ${formData.company || "N/A"}

---

**Message:**
${formData.message}
  `;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Scanminers-Website-Contact-Form",
        },
        body: JSON.stringify({
          title: `New Lead: ${formData.name}`,
          body: issueBody,
          labels: ["lead"],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to create GitHub issue:", errorData);
    } else {
      console.log("Successfully created GitHub issue as a backup.");
    }
  } catch (error) {
    console.error("Error creating GitHub issue:", error);
  }
}

type ContactPayload = {
  name: string;
  email: string;
  company?: string;
  message: string;
  token: string;
};

export async function POST(req: NextRequest) {
  // Basic Edge-safe rate limiting by IP
  const ipForLimit =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anon";
  if (isRateLimited(ipForLimit)) {
    return NextResponse.json(
      { success: false, message: "Too many requests." },
      { status: 429 }
    );
  }

  const { name, email, company, message, token } =
    (await req.json()) as ContactPayload;

  const formData = new FormData();
  formData.append("secret", process.env.TURNSTILE_SECRET_KEY!);
  formData.append("response", token);
  const ip =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "";
  if (ip) formData.append("remoteip", ip);

  const turnstileResponse = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData,
    }
  );

  const outcome = (await turnstileResponse.json()) as { success?: boolean };
  if (!outcome.success) {
    return NextResponse.json(
      { success: false, message: "Invalid Turnstile token." },
      { status: 400 }
    );
  }

  // Persist lead details (best-effort)
  try {
    await createLead({
      type: "contact",
      source: "contact-form",
      name,
      email,
      company,
      message,
      metadata: {
        ip,
        userAgent: req.headers.get("user-agent") || undefined,
      },
    });
  } catch (error) {
    console.error("[CONTACT] Failed to persist lead", error);
  }

  // Send email notification using sendEmail helper
  const toEnv = process.env.RESEND_TO || "founders@scanminers.com";
  const to = toEnv.includes(",")
    ? toEnv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [toEnv];
  const subject = "New Contact Form Submission from Scanminers Website";

  const escapeHtml = (s: string) =>
    s.replace(
      /[&<>"']/g,
      (ch) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[ch] as string)
    );

  const html = `<!doctype html>
    <html><body style="font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#111;">
      <h1 style="font-size:18px;">New Contact Form Submission</h1>
      <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;max-width:640px;width:100%">
        <tr><td style="background:#f5f5f5;width:160px;font-weight:600;vertical-align:top;">Name</td><td>${escapeHtml(
          name
        )}</td></tr>
        <tr><td style="background:#f5f5f5;width:160px;font-weight:600;vertical-align:top;">Email</td><td>${escapeHtml(
          email
        )}</td></tr>
        ${
          company
            ? `<tr><td style=\"background:#f5f5f5;width:160px;font-weight:600;vertical-align:top;\">Company</td><td>${escapeHtml(
                company
              )}</td></tr>`
            : ""
        }
        <tr><td style="background:#f5f5f5;width:160px;font-weight:600;vertical-align:top;">Message</td><td><div style="white-space:pre-wrap;line-height:1.5">${escapeHtml(
          message
        )}</div></td></tr>
      </table>
      <p style="font-size:12px;color:#555;margin-top:16px;">Sent from the Scanminers website contact form.</p>
    </body></html>`;

  const emailResult = await sendEmail({
    to,
    subject,
    html,
    replyTo: email,
  });

  if (!emailResult.success) {
    console.error("[CONTACT] Failed to send email:", emailResult.error);
    return NextResponse.json(
      {
        success: false,
        message:
          "Your message was saved but we could not send the email notification. We will still review your submission.",
      },
      { status: 500 }
    );
  }

  console.log("[CONTACT] Email sent successfully");

  // GitHub issue backup (best-effort)
  await createGitHubIssue({ name, email, company, message });

  return NextResponse.json({ success: true });
}
