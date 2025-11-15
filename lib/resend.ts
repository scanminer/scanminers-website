type EmailRecipient = string | string[];

export type SendEmailOptions = {
  to: EmailRecipient;
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
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
      body: JSON.stringify({ from, to: recipients, subject, html, reply_to: replyTo }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("[resend] API error", resp.status, text);
      return { success: false, error: text };
    }

    return { success: true };
  } catch (error) {
    console.error("[resend] request failed", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
