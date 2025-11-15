import { brandProofPoints, getBrandChecklist, getBrandHeroCopy, getBrandGuide } from '@/lib/brand-content'

const foundation = getBrandGuide('foundation')
const messaging = getBrandGuide('messaging')
const evidence = getBrandGuide('evidence')

export const brandNarrative = {
  heroTagline: foundation?.heroTagline || messaging?.heroTagline || 'Subsurface intelligence that moves decisions forward.',
  elevatorPitch:
    foundation?.elevatorPitch ||
    messaging?.elevatorPitch ||
    'Scanminers combines multi-sensor data, explainable AI, and geologic expertise to surface investor-grade mineral intelligence in days.',
  mission: foundation?.summary || 'Reveal responsible mineral opportunity faster than traditional exploration.',
  summary: foundation?.summary || messaging?.summary || '',
  pillars: foundation?.pillars ?? messaging?.pillars ?? [],
  checklist: getBrandChecklist(),
  proofPoints: brandProofPoints,
  keywords: foundation?.keywords ?? messaging?.keywords ?? [],
}

export const messagingPrompts = messaging?.prompts ?? []

export const narrativeOverview = {
  foundation,
  messaging,
  evidence,
}

export function getNarrativePillars() {
  return (foundation?.pillars ?? []).map((pillar) => ({
    ...pillar,
    category: 'foundation',
  }))
}

export function getHeroCopyVariants() {
  return getBrandHeroCopy()
}
