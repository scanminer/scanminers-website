import { allBrandGuides } from "contentlayer/generated"
import { BrandPortal, type BrandAdminSection } from "@/components/admin/brand/BrandPortal"
import { brandGuardrails, brandPrompts } from "@/lib/brand-content"
import { buildBrandSystemPrompt } from "@/lib/ai-brand"

export const revalidate = 0

function serializeSections(): BrandAdminSection[] {
  return [...allBrandGuides]
    .sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0))
    .map((section) => ({
    slug: section.slug,
    title: section.title,
    category: section.category,
    summary: section.summary,
    status: section.status,
    heroTagline: section.heroTagline ?? null,
    elevatorPitch: section.elevatorPitch ?? null,
    keywords: section.keywords ?? [],
    checklist: section.checklist ?? [],
    updatedAt: section.updatedAt ?? null,
    updatedBy: section.updatedBy ?? null,
    body: section.body?.raw ?? "",
    }))
}

export default function AdminBrandPage() {
  const sections = serializeSections()
  const systemPrompt = buildBrandSystemPrompt()
  return <BrandPortal sections={sections} guardrails={brandGuardrails} prompts={brandPrompts} systemPrompt={systemPrompt} />
}
