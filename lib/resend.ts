type EmailRecipient = string | string[];

export type SendEmailOptions = {
  to: EmailRecipient;
  subject: string;
  html: string;
  replyTo?: string;
  projectId?: string;
};

export type SendEmailResult = {
  success: boolean;
  error?: string;
  emailId?: string;
};

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
  projectId,
}: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set; skipping email send.");
    return { success: false, error: "Resend API key missing" };
  }

  const from = process.env.RESEND_FROM || "contact@scanminers.com";
  const recipients = Array.isArray(to) ? to : [to];

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject,
        html,
        reply_to: replyTo,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("[resend] API error", resp.status, text);
      return { success: false, error: text };
    }

    const data = await resp.json();
    const emailId = (data as { id?: string }).id;

    // Track email in database if projectId provided
    if (projectId && emailId) {
      try {
        await trackProjectEmail({
          projectId,
          direction: "outbound",
          subject,
          body: html,
          fromEmail: from,
          toEmail: recipients.join(", "),
          resendId: emailId,
          status: "sent",
        });
      } catch (error) {
        console.error("[resend] Failed to track email in database", error);
      }
    }

    return { success: true, emailId };
  } catch (error) {
    console.error("[resend] request failed", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function trackProjectEmail(email: {
  projectId: string;
  direction: "inbound" | "outbound";
  subject: string;
  body: string;
  fromEmail?: string;
  toEmail?: string;
  resendId?: string;
  status: string;
}) {
  const { nanoid } = await import("nanoid");
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const context = await getCloudflareContext();
  const env = context?.env as { LEADS_DB?: unknown } | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = env?.LEADS_DB as any;
  if (!db) return;

  await db
    .prepare(
      `INSERT INTO project_emails (id, project_id, direction, subject, body, from_email, to_email, resend_id, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      nanoid(16),
      email.projectId,
      email.direction,
      email.subject,
      email.body,
      email.fromEmail || null,
      email.toEmail || null,
      email.resendId || null,
      email.status,
      new Date().toISOString()
    )
    .run();
}
