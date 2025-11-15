import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isRateLimited } from "@/lib/rate-limiter";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { sendEmail } from "@/lib/resend";
import { createLead } from "@/lib/lead-store";

const consultationSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    company: z.string().min(2),
    role: z.string().min(2),
    regions: z.string().min(3),
    commodities: z.array(z.string()).min(1),
    dataSources: z.array(z.string()).optional().default([]),
    stage: z.string().min(2),
    timing: z.string().min(2),
    context: z.string().optional().default(""),
    token: z.string().min(1),
    consent: z.boolean(),
    sourceCommodity: z.string().optional(),
  })
  .refine((data) => data.consent === true, { path: ["consent"], message: "Consent must be accepted." });

type ConsultationPayload = z.infer<typeof consultationSchema>;
type ConsultationEmailPayload = Omit<ConsultationPayload, "token">;

const bankDetails = {
  accountName: process.env.CONSULT_BANK_ACCOUNT_NAME || process.env.CONSULT_BANK_ACCOUNT || "Scanminers",
  iban: process.env.CONSULT_BANK_IBAN,
  bic: process.env.CONSULT_BANK_BIC,
  note: process.env.CONSULT_BANK_NOTE,
};

const formatList = (items: string[]) => (items.length ? items.join(", ") : "—");

const buildInternalEmail = (reference: string, data: ConsultationEmailPayload) => `<!doctype html>
<html><body style="font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#111;">
  <h1 style="font-size:18px; margin-bottom:12px;">Consultation Request (${reference})</h1>
  <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;max-width:640px;width:100%">
    <tr><td style="background:#f5f5f5;width:160px;font-weight:600;">Name</td><td>${data.name}</td></tr>
    <tr><td style="background:#f5f5f5;font-weight:600;">Email</td><td>${data.email}</td></tr>
    <tr><td style="background:#f5f5f5;font-weight:600;">Company</td><td>${data.company}</td></tr>
    <tr><td style="background:#f5f5f5;font-weight:600;">Role</td><td>${data.role}</td></tr>
    <tr><td style="background:#f5f5f5;font-weight:600;">Regions</td><td>${data.regions}</td></tr>
    <tr><td style="background:#f5f5f5;font-weight:600;">Commodities</td><td>${formatList(data.commodities)}</td></tr>
    <tr><td style="background:#f5f5f5;font-weight:600;">Data sources</td><td>${formatList(data.dataSources ?? [])}</td></tr>
    <tr><td style="background:#f5f5f5;font-weight:600;">Stage</td><td>${data.stage}</td></tr>
    <tr><td style="background:#f5f5f5;font-weight:600;">Timing</td><td>${data.timing}</td></tr>
    <tr><td style="background:#f5f5f5;font-weight:600;">Source commodity</td><td>${data.sourceCommodity || "—"}</td></tr>
    <tr><td style="background:#f5f5f5;font-weight:600;">Context</td><td><div style="white-space:pre-wrap;line-height:1.5">${data.context || "—"}</div></td></tr>
  </table>
</body></html>`;

const buildClientEmail = (reference: string) => {
  const paymentRows = [
    bankDetails.accountName ? `<li><strong>Account name:</strong> ${bankDetails.accountName}</li>` : null,
    bankDetails.iban ? `<li><strong>IBAN:</strong> ${bankDetails.iban}</li>` : null,
    bankDetails.bic ? `<li><strong>SWIFT/BIC:</strong> ${bankDetails.bic}</li>` : null,
  ].filter(Boolean);

  return `<!doctype html>
<html><body style="font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#111;">
  <p style="font-size:16px;">Thank you for requesting a Scanminers consultation. Your reference is <strong>${reference}</strong>.</p>
  <p>Next steps:</p>
  <ol>
    <li>Arrange payment using the bank details below.</li>
    <li>Reply to this email with proof of payment or remittance advice.</li>
    <li>We will follow up within one business day with proposed times.</li>
  </ol>
  <p style="margin-top:16px;">Payment reference: <strong>${reference}</strong></p>
  ${paymentRows.length ? `<ul>${paymentRows.join("")}</ul>` : `<p>Bank details will be shared by reply.</p>`}
  ${bankDetails.note ? `<p style="margin-top:12px;">${bankDetails.note}</p>` : ""}
  <p style="margin-top:16px;font-size:12px;color:#666;">This consultation fee is credited against any Scanminers project launched within six months.</p>
</body></html>`;
};

const getTeamRecipients = () => {
  const toEnv = process.env.RESEND_TO || "you@example.com";
  return toEnv.split(",").map((entry) => entry.trim()).filter(Boolean);
};

const generateReference = () => {
  const now = new Date();
  const prefix = `CONSULT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const suffix = Math.floor(Math.random() * 10_000)
    .toString()
    .padStart(4, "0");
  return `${prefix}-${suffix}`;
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (isRateLimited(ip)) {
    return NextResponse.json({ success: false, message: "Too many requests." }, { status: 429 });
  }

  let payload: ConsultationPayload;
  try {
    payload = consultationSchema.parse(await req.json());
  } catch (err) {
    console.error("[consultation] invalid payload", err);
    return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
  }

  const captchaOk = await verifyTurnstileToken(payload.token, req);
  if (!captchaOk) {
    return NextResponse.json({ success: false, message: "Invalid Turnstile token." }, { status: 400 });
  }

  const reference = generateReference();
  const { token: discardedToken, ...safePayload } = payload;
  void discardedToken;

  try {
    await createLead({
      type: "consultation",
      source: "consultation",
      name: safePayload.name,
      email: safePayload.email,
      company: safePayload.company,
      role: safePayload.role,
      message: safePayload.context,
      additionalContext: safePayload.context,
      region: safePayload.regions,
      stage: safePayload.stage,
      timing: safePayload.timing,
      commodities: safePayload.commodities,
      reference,
      metadata: {
        reference,
        commodities: safePayload.commodities,
        dataSources: safePayload.dataSources,
        sourceCommodity: safePayload.sourceCommodity,
        consent: safePayload.consent,
        ip,
      },
    });
  } catch (error) {
    console.error("[consultation] failed to persist lead", error);
  }

  const internalHtml = buildInternalEmail(reference, safePayload);
  const clientHtml = buildClientEmail(reference);

  const teamRecipients = getTeamRecipients();

  const internalEmail = await sendEmail({
    to: teamRecipients,
    subject: `[Scanminers] Consultation Request – ${safePayload.company}`,
    html: internalHtml,
    replyTo: safePayload.email,
  });

  if (!internalEmail.success) {
    return NextResponse.json({ success: false, message: "Failed to notify team." }, { status: 500 });
  }

  const clientEmail = await sendEmail({
    to: safePayload.email,
    subject: `Scanminers consultation request (${reference})`,
    html: clientHtml,
  });

  if (!clientEmail.success) {
    return NextResponse.json({ success: false, message: "Failed to send confirmation." }, { status: 500 });
  }

  return NextResponse.json({ success: true, reference });
}
