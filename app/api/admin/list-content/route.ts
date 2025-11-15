// app/api/admin/list-content/route.ts
import { NextResponse } from "next/server";
import type { Insight, CaseStudy, Brief } from "contentlayer/generated";
import { allInsights, allCaseStudies, allBriefs } from "contentlayer/generated";

type RawDoc = { slug?: string; title?: string; _raw?: { flattenedPath?: string; sourceFilePath?: string } };

function getSlugFor(doc: RawDoc): string {
  if (doc && typeof doc.slug === "string") return doc.slug;
  const raw = (doc && doc._raw && (doc._raw.flattenedPath || doc._raw.sourceFilePath)) || "";
  return raw
    .replace(/^insights\//, "")
    .replace(/^case-studies\//, "")
    .replace(/^briefs\//, "")
    .replace(/\.mdx?$/i, "");
}

function getPathFor(doc: RawDoc): string {
  const p = doc && doc._raw && (doc._raw.sourceFilePath || doc._raw.flattenedPath);
  return p || "";
}

export async function GET() {
  try {
    const insights = (allInsights as Insight[]).map((d) => ({ slug: getSlugFor(d as unknown as RawDoc), path: getPathFor(d as unknown as RawDoc), title: d.title || "(untitled)" }));
    const cases = (allCaseStudies as CaseStudy[]).map((d) => ({ slug: getSlugFor(d as unknown as RawDoc), path: getPathFor(d as unknown as RawDoc), title: d.title || "(untitled)" }));
    const briefs = (allBriefs as Brief[]).map((d) => ({ slug: getSlugFor(d as unknown as RawDoc), path: getPathFor(d as unknown as RawDoc), title: (d as unknown as RawDoc).title || "(untitled)" }));
    return NextResponse.json({ success: true, ok: true, insights, cases, briefs });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ success: false, ok: false, error: message }, { status: 500 });
  }
}
