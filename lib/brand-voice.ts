import { brandGuardrails, brandPrompts, brandVoiceExamples, getBrandGuide } from '@/lib/brand-content'

const voiceSection = getBrandGuide('voice')

export const brandVoice = {
  summary: voiceSection?.summary || 'Confident, grounded, collaborative, and responsible.',
  checklist: voiceSection?.checklist ?? [],
  guardrails: brandGuardrails,
  examples: brandVoiceExamples,
  prompts: (voiceSection?.prompts ?? []).concat(
    brandPrompts.filter((prompt) => prompt.tags?.includes('guardrail'))
  ),
}

export function buildVoiceReminder(params?: { medium?: string; audience?: string; focus?: string }) {
  const lines: string[] = []
  if (params?.medium) {
    lines.push(`Channel: ${params.medium}`)
  }
  if (params?.audience) {
    lines.push(`Audience: ${params.audience}`)
  }
  if (params?.focus) {
    lines.push(`Focus: ${params.focus}`)
  }

  lines.push('Tone pillars: confident, grounded, collaborative, responsible.')
  lines.push('Guardrails:')
  brandGuardrails.slice(0, 3).forEach((guardrail) => {
    lines.push(`- ${guardrail.rule}${guardrail.severity ? ` (${guardrail.severity})` : ''}`)
  })

  if (brandVoiceExamples.length) {
    const sample = brandVoiceExamples[0]
    lines.push('Example rewrite:')
    if (sample.before) {
      lines.push(`Before: ${sample.before}`)
    }
    lines.push(`After: ${sample.after}`)
  }

  return lines.join('\n')
}
