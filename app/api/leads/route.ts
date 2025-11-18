import { type NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limiter";
import {
  createLead,
  type LeadType,
  type LeadCreateInput,
} from "@/lib/lead-store";

type LeadPayload = {
  type: LeadType;
  source: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  message?: string;
  goal?: string;
  context?: string;
  additionalContext?: string;
  regions?: string;
  region?: string;
  stage?: string;
  timing?: string;
  commodities?: string[];
  reference?: string;
  metadata?: Record<string, unknown>;
  token: string; // Turnstile token
};

/**
 * Unified API endpoint for lead creation
 * All public-facing forms (contact, consultation, prospectivity brief) use this endpoint
 */
export async function POST(req: NextRequest) {
  // Rate limiting by IP
  const ipForLimit =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anon";

  if (isRateLimited(ipForLimit)) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let payload: LeadPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  // Validate required fields
  if (!payload.token) {
    return NextResponse.json(
      { success: false, message: "Turnstile token is required." },
      { status: 400 }
    );
  }

  if (!payload.name || !payload.email) {
    return NextResponse.json(
      { success: false, message: "Name and email are required." },
      { status: 400 }
    );
  }

  if (
    !payload.type ||
    !["contact", "consultation", "prospectivity_brief"].includes(payload.type)
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid lead type." },
      { status: 400 }
    );
  }

  // Verify Turnstile token
  const formData = new FormData();
  formData.append("secret", process.env.TURNSTILE_SECRET_KEY!);
  formData.append("response", payload.token);

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

  // Create lead record
  try {
    const leadInput: LeadCreateInput = {
      type: payload.type,
      source: payload.source || `${payload.type}-form`,
      name: payload.name,
      email: payload.email,
      company: payload.company,
      role: payload.role,
      message: payload.message,
      goal: payload.goal,
      context: payload.context,
      additionalContext: payload.additionalContext,
      regions: payload.regions,
      region: payload.region,
      stage: payload.stage,
      timing: payload.timing,
      commodities: payload.commodities,
      reference: payload.reference,
      metadata: {
        ...payload.metadata,
        ip,
        userAgent: req.headers.get("user-agent") || undefined,
        referer: req.headers.get("referer") || undefined,
      },
    };

    const lead = await createLead(leadInput);

    console.log(
      `[leads] Created ${lead.type} lead: ${lead.id} - ${lead.name} <${lead.email}>`
    );

    return NextResponse.json({
      success: true,
      message: "Thank you for your submission. We'll be in touch soon!",
      leadId: lead.id,
    });
  } catch (error) {
    console.error("[leads] Failed to create lead:", error);

    // Don't expose internal errors to clients
    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to process your request. Please try again or contact us directly.",
      },
      { status: 500 }
    );
  }
}
