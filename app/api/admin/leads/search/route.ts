import { NextResponse } from "next/server";
import { listLeads } from "@/lib/lead-store";

export async function GET() {
  try {
    const { leads } = await listLeads({ limit: 100 });

    // Return simplified lead data for search/select
    const simplified = leads.map((lead) => ({
      id: lead.id,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      status: lead.status,
    }));

    return NextResponse.json({ leads: simplified });
  } catch (error) {
    console.error("Failed to fetch leads for search:", error);
    return NextResponse.json({ leads: [] }, { status: 500 });
  }
}
