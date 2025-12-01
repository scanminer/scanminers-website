/**
 * Scanminers Brain API - Related Knowledge
 *
 * POST /api/scanminers-brain/related
 *
 * Takes lead/project context and returns related knowledge items
 * with AI-generated assessment.
 */

import { NextRequest, NextResponse } from "next/server";
import { queryBrain, BrainQuerySchema } from "@/lib/scanminers-brain";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parseResult = BrainQuerySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const query = parseResult.data;

    // Query the brain
    const response = await queryBrain(query);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Brain query error:", error);

    // Don't expose internal errors
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    // Check for specific error types
    if (message.includes("OPENAI_API_KEY")) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to query Scanminers Brain" },
      { status: 500 }
    );
  }
}

// Also support GET for simple testing
export async function GET() {
  try {
    const { getStoreStats } = await import("@/lib/scanminers-brain");
    const stats = await getStoreStats();

    return NextResponse.json({
      status: "ok",
      brainVersion: "0.1.0",
      storeVersion: stats.version,
      totalItems: stats.itemCount,
      totalEmbeddings: stats.embeddingCount,
      lastUpdated: stats.lastUpdated,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
