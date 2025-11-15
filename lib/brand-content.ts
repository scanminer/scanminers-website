import type { BrandGuide } from 'contentlayer/generated'
import { allBrandGuides } from 'contentlayer/generated'

export type BrandCategory = BrandGuide['category']
export type BrandSection = BrandGuide
type ArrayElement<T> = T extends Array<infer U> ? U : never

export type BrandPromptEntry = ArrayElement<NonNullable<BrandGuide['prompts']>>
export type BrandGuardrailEntry = ArrayElement<NonNullable<BrandGuide['guardrails']>>
export type BrandVoiceExampleEntry = ArrayElement<NonNullable<BrandGuide['voiceExamples']>>
export type BrandProofPointEntry = ArrayElement<NonNullable<BrandGuide['proofPoints']>>
export type BrandColorToken = ArrayElement<NonNullable<BrandGuide['colorPalette']>>
export type BrandTypographyToken = ArrayElement<NonNullable<BrandGuide['typography']>>

const sortByWeight = (a: BrandGuide, b: BrandGuide) => {
  const aWeight = typeof a.weight === 'number' ? a.weight : 0
  const bWeight = typeof b.weight === 'number' ? b.weight : 0
  if (aWeight === bWeight) {
    return a.slug.localeCompare(b.slug)
  }
  return aWeight - bWeight
}

const normalizeList = <T>(value: T[] | undefined): T[] => (Array.isArray(value) ? value : [])
const normalizeObjectList = <T extends Record<string, unknown>>(value: T[] | undefined): T[] =>
  Array.isArray(value) ? value : []

const sections = [...allBrandGuides].sort(sortByWeight)
const approvedSections = sections.filter((section) => section.isApproved)

const sectionMap = new Map<string, BrandGuide>(sections.map((section) => [section.slug, section]))

const groupByCategory = sections.reduce<Record<BrandCategory, BrandGuide[]>>((acc, section) => {
  const category = section.category
  if (!acc[category]) {
    acc[category] = []
  }
  acc[category]!.push(section)
  return acc
}, {} as Record<BrandCategory, BrandGuide[]>)

export const brandGuideIndex = {
  all: sections,
  approved: approvedSections,
  bySlug: sectionMap,
  byCategory: groupByCategory,
}

export const brandPrompts: Array<(BrandPromptEntry & { section: string; category: BrandCategory })> = approvedSections
  .flatMap((section) =>
    normalizeObjectList(section.prompts as BrandPromptEntry[] | undefined).map((prompt) => ({
      ...prompt,
      section: section.slug,
      category: section.category,
    }))
  )

export const brandGuardrails: Array<BrandGuardrailEntry & { section: string; category: BrandCategory }> =
  approvedSections.flatMap((section) =>
    normalizeObjectList(section.guardrails as BrandGuardrailEntry[] | undefined).map((guardrail) => ({
      ...guardrail,
      section: section.slug,
      category: section.category,
    }))
  )

export const brandVoiceExamples: Array<BrandVoiceExampleEntry & { section: string; category: BrandCategory }> =
  approvedSections.flatMap((section) =>
    normalizeObjectList(section.voiceExamples as BrandVoiceExampleEntry[] | undefined).map((example) => ({
      ...example,
      section: section.slug,
      category: section.category,
    }))
  )

export const brandProofPoints: Array<BrandProofPointEntry & { section: string; category: BrandCategory }> =
  approvedSections.flatMap((section) =>
    normalizeObjectList(section.proofPoints as BrandProofPointEntry[] | undefined).map((proof) => ({
      ...proof,
      section: section.slug,
      category: section.category,
    }))
  )

export const brandColorPalette: Array<BrandColorToken & { section: string }> = approvedSections.flatMap((section) =>
  normalizeObjectList(section.colorPalette as BrandColorToken[] | undefined).map((color) => ({
    ...color,
    section: section.slug,
  }))
)

export const brandTypographyScale: Array<BrandTypographyToken & { section: string }> = approvedSections.flatMap(
  (section) =>
    normalizeObjectList(section.typography as BrandTypographyToken[] | undefined).map((style) => ({
      ...style,
      section: section.slug,
    }))
)

export const getBrandGuide = (slug: string) => sectionMap.get(slug)

export const getBrandSectionsByCategory = (category: BrandCategory) =>
  sections.filter((section) => section.category === category)

export const getApprovedBrandSectionsByCategory = (category: BrandCategory) =>
  approvedSections.filter((section) => section.category === category)

export const getVoiceExamplesForMedium = (medium: string) =>
  brandVoiceExamples.filter((example) => {
    const section = getBrandGuide(example.section)
    if (!section) return false
    if (!section.mediums || section.mediums.length === 0) return true
    return section.mediums.includes(medium)
  })

export const getBrandChecklist = () =>
  approvedSections.flatMap((section) =>
    normalizeList(section.checklist).map((item) => ({
      item,
      section: section.slug,
      category: section.category,
    }))
  )

export const getBrandHeroCopy = () =>
  approvedSections
    .filter((section) => section.heroTagline || section.elevatorPitch)
    .map((section) => ({
      hero: section.heroTagline,
      pitch: section.elevatorPitch,
      section: section.slug,
      category: section.category,
    }))

export const getBrandSampleQuestions = () =>
  approvedSections.flatMap((section) =>
    normalizeList(section.sampleQuestions).map((question) => ({
      question,
      section: section.slug,
      category: section.category,
    }))
  )
