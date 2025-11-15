import { brandNarrative, messagingPrompts } from '@/lib/brand-core'
import { brandPrompts, brandProofPoints, getBrandSampleQuestions } from '@/lib/brand-content'
import { brandVisualIdentity } from '@/lib/brand-visual'
import { brandVoice, buildVoiceReminder } from '@/lib/brand-voice'

export type BrandContextOptions = {
  medium?: string
  audience?: string
  mineral?: string
  geography?: string
  desiredOutcome?: string
}

export function buildBrandContext(options: BrandContextOptions = {}) {
  const questions = getBrandSampleQuestions()
  return {
    narrative: brandNarrative,
    voice: brandVoice,
    prompts: suggestBrandPrompts(options),
    proof: brandProofPoints,
    visuals: brandVisualIdentity,
    discoveryQuestions: questions,
    reminder: buildBrandReminder(options),
  }
}

export function buildBrandReminder(options: BrandContextOptions = {}) {
  const lines: string[] = []
  if (options.medium) lines.push(`Medium: ${options.medium}`)
  if (options.audience) lines.push(`Audience: ${options.audience}`)
  if (options.mineral) lines.push(`Mineral focus: ${options.mineral}`)
  if (options.geography) lines.push(`Geography: ${options.geography}`)
  if (options.desiredOutcome) lines.push(`Desired outcome: ${options.desiredOutcome}`)

  lines.push(`Hero: ${brandNarrative.heroTagline}`)
  lines.push(`Elevator pitch: ${brandNarrative.elevatorPitch}`)
  lines.push(buildVoiceReminder(options))
  if (brandVisualIdentity.colors.length) {
    const primary = brandVisualIdentity.colors[0]
    lines.push(`Primary color cue: ${primary.name} ${primary.hex}`)
  }
  return lines.join('\n')
}

export function buildBrandSystemPrompt(options: BrandContextOptions = {}) {
  const reminder = buildBrandReminder(options)
  const checklist = brandNarrative.checklist.map((entry) => `- ${entry.item}`).join('\n')
  const proof = brandProofPoints
    .slice(0, 3)
    .map((point) => `- ${point.headline}: ${point.detail}${point.metric ? ` (${point.metric})` : ''}`)
    .join('\n')

  return [
    'You are writing on behalf of Scanminers, the subsurface intelligence company.',
    'Voice must remain confident, grounded, collaborative, and responsible.',
    `Reminder:\n${reminder}`,
    'Brand checklist:',
    checklist,
    'Proof references:',
    proof,
    'Always cite data sources or pilots when referencing outcomes and invite collaboration.',
  ].join('\n\n')
}

export function suggestBrandPrompts(options: BrandContextOptions = {}) {
  if (options.medium) {
    const mediumMatches = brandPrompts.filter((prompt) => prompt.tags?.includes(options.medium!))
    if (mediumMatches.length) return mediumMatches
  }
  if (options.audience) {
    const audienceMatches = brandPrompts.filter((prompt) => prompt.tags?.includes(options.audience!))
    if (audienceMatches.length) return audienceMatches
  }
  return messagingPrompts.length ? messagingPrompts : brandPrompts
}

export function getBrandPromptByName(name: string) {
  return brandPrompts.find((prompt) => prompt.name.toLowerCase() === name.toLowerCase())
}
