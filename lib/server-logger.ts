type ErrorContext = Record<string, unknown>;

type SentryDsnParts = {
  dsn: string;
  publicKey: string;
  host: string;
  projectId: string;
};

function parseSentryDsn(input: string): SentryDsnParts | null {
  try {
    const url = new URL(input);
    const publicKey = url.username;
    const host = url.host;
    const projectId = url.pathname.replace(/^\//, "");
    if (!publicKey || !host || !projectId) return null;
    return { dsn: input, publicKey, host, projectId };
  } catch {
    return null;
  }
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  if (typeof error === "string") {
    return { message: error };
  }
  try {
    return { message: JSON.stringify(error) };
  } catch {
    return { message: String(error) };
  }
}

export async function reportServerError(error: unknown, context: ErrorContext = {}): Promise<void> {
  console.error("[server-error]", context, error);
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  const parts = parseSentryDsn(dsn);
  if (!parts) return;

  try {
    const eventId = crypto.randomUUID();
    const envelopeHeaders = {
      event_id: eventId,
      sent_at: new Date().toISOString(),
      dsn: parts.dsn,
    };

    const body = {
      event_id: eventId,
      timestamp: Date.now() / 1000,
      platform: "javascript",
      level: "error" as const,
      environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
      tags: { scope: "admin-leads" },
      extra: { ...context, serializedError: serializeError(error) },
    };

    const envelope = `${JSON.stringify(envelopeHeaders)}\n${JSON.stringify({ type: "event" })}\n${JSON.stringify(body)}`;
    const endpoint = `https://${parts.host}/api/${parts.projectId}/envelope/?sentry_key=${parts.publicKey}&sentry_version=7`;

    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-sentry-envelope" },
      body: envelope,
      keepalive: true,
    });
  } catch (sendError) {
    console.error("[server-error] failed to send to Sentry", sendError);
  }
}
