import { NextResponse } from "next/server";
import { listProjects } from "@/lib/project-store";

export async function GET() {
  try {
    const projects = await listProjects({ limit: 100 });

    // Return simplified project data for search/select
    const simplified = projects.map((project) => ({
      id: project.id,
      projectName: project.projectName,
      clientName: project.clientName,
      status: project.status,
    }));

    return NextResponse.json({ projects: simplified });
  } catch (error) {
    console.error("Failed to fetch projects for search:", error);
    return NextResponse.json({ projects: [] }, { status: 500 });
  }
}
