import { brandColorPalette, brandTypographyScale, getBrandGuide } from '@/lib/brand-content'

const visualSection = getBrandGuide('visual-identity')

export const brandVisualIdentity = {
  summary: visualSection?.summary || 'Dark intelligence surfaces, mineral-inspired accents, and accessible typography.',
  checklist: visualSection?.checklist ?? [],
  colors: brandColorPalette,
  typography: brandTypographyScale,
}

export function getPrimaryColor() {
  return brandColorPalette.find((color) => color.role === 'primary') || brandColorPalette[0]
}

export function getAccentColors() {
  return brandColorPalette.filter((color) => color.role === 'accent' || color.role === 'call-to-action')
}
