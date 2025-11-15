import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isRateLimited } from "@/lib/rate-limiter";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { sendEmail } from "@/lib/resend";
import { createLead } from "@/lib/lead-store";

const briefSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    company: z.string().min(2),
    role: z.string().min(2),
    regions: z.string().min(3),
    commodities: z.array(z.string()).min(1),
    dataSources: z.array(z.string()).optional().default([]),
    stage: z.string().min(2),
    goal: z.string().min(3),
    context: z.string().optional().default(""),
    token: z.string().min(1),
    expectation: z.boolean(),
    sourceCommodity: z.string().optional(),
  })
  .refine((data) => data.expectation === true, { path: ["expectation"], message: "Expectation must be acknowledged." });

type BriefPayload = z.infer<typeof briefSchema>;
type BriefEmailPayload = Omit<BriefPayload, "token">;

const formatList = (items: string[]) => (items.length ? items.join(", ") : "—");

const buildInternalEmail = (data: BriefEmailPayload) => `<!doctype html>
<html><body style="font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#111;">
  <h1 style="font-size:18px; margin-bottom:12px;">Prospectivity Brief Request</h1>
  <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;max-width:640px;width:100%">
    <tr><td style="background:#f5f5f5;width:160px;font-weight:600;">Name</td><td>${data.name}</td></tr>
    <tr><td style="background:#f5f5f5;font-weight:600;">Email</td><td>${data.email}</td></tr>
    <tr><td style="background:#f5f5f5;font-weight:600;">Company</td><td>${data.company}</td></tr>
    <tr><td style="background:#f5f5f5;font-weight:600;">Role</td><td>${data.role}</td></tr>
    <tr><td style="background:#f5f5f5;font-weight:600;">Regions</td><td>${data.regions}</td></tr>
    <tr><td style="background:#f5f5f5;font-weight:600;">Commodities</td><td>${formatList(data.commodities)}</td></tr>
    <tr><td style="background:#f5f5f5;font-weight:600;">Data sources</td><td>${formatList(data.dataSources ?? [])}</td></tr>
    <tr><td style="background:#f5f5f5;font-weight:600;">Stage</td><td>${data.stage}</td></tr>
    <tr><td style="background:#f5f5f5;font-weight:600;">Goal</td><td><div style="white-space:pre-wrap;line-height:1.5">${data.goal}</div></td></tr>
    <tr><td style="background:#f5f5f5;font-weight:600;">Context</td><td><div style="white-space:pre-wrap;line-height:1.5">${data.context || "—"}</div></td></tr>
    <tr><td style="background:#f5f5f5;font-weight:600;">Source commodity</td><td>${data.sourceCommodity || "—"}</td></tr>
  </table>
</body></html>`;

const buildClientEmail = () => `<!doctype html>
<html><body style="font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#111;">
  <p style="font-size:16px;">Thank you for requesting a Scanminers prospectivity brief.</p>
  <p>We will review your submission, assess data availability, and respond with fit + recommended next steps. If the project looks like a match, we’ll outline potential workflows and when a paid engagement makes sense.</p>
  <p style="margin-top:16px;font-size:12px;color:#666;">Typical turnaround: 2–3 business days.</p>
</body></html>`;

const getTeamRecipients = () => {
  const toEnv = process.env.RESEND_TO || "you@example.com";
  return toEnv.split(",").map((entry) => entry.trim()).filter(Boolean);
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (isRateLimited(ip)) {
    return NextResponse.json({ success: false, message: "Too many requests." }, { status: 429 });
  }

  let payload: BriefPayload;
  try {
    payload = briefSchema.parse(await req.json());
  } catch (err) {
    console.error("[prospectivity-brief] invalid payload", err);
    return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
  }

  const captchaOk = await verifyTurnstileToken(payload.token, req);
  if (!captchaOk) {
    return NextResponse.json({ success: false, message: "Invalid Turnstile token." }, { status: 400 });
  }

  const { token: discardedToken, ...safePayload } = payload;
  void discardedToken;

  try {
    await createLead({
      type: "prospectivity_brief",
      source: "prospectivity-brief",
      name: safePayload.name,
      email: safePayload.email,
      company: safePayload.company,
      role: safePayload.role,
      goal: safePayload.goal,
      additionalContext: safePayload.context,
      region: safePayload.regions,
      stage: safePayload.stage,
      message: safePayload.goal,
      commodities: safePayload.commodities,
      metadata: {
        commodities: safePayload.commodities,
        dataSources: safePayload.dataSources,
        sourceCommodity: safePayload.sourceCommodity,
        expectation: safePayload.expectation,
        ip,
      },
    });
  } catch (error) {
    console.error("[prospectivity-brief] failed to persist lead", error);
  }

  const internalEmail = await sendEmail({
    to: getTeamRecipients(),
    subject: `[Scanminers] Prospectivity Brief Request – ${safePayload.company}`,
    html: buildInternalEmail(safePayload),
    replyTo: safePayload.email,
  });

  if (!internalEmail.success) {
    return NextResponse.json({ success: false, message: "Failed to notify team." }, { status: 500 });
  }

  const clientEmail = await sendEmail({
    to: safePayload.email,
    subject: "We received your prospectivity brief request",
    html: buildClientEmail(),
  });

  if (!clientEmail.success) {
    return NextResponse.json({ success: false, message: "Failed to send confirmation." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
