/**
 * Mineral Image System
 *
 * Provides centralized access to mineral background images and their supporting
 * creative direction metadata. All assets live in /public/minerals/.
 */

export type MineralTextureSlug =
  | 'lithium'
  | 'cobalt'
  | 'nickel'
  | 'copper'
  | 'ree'
  | 'graphite'
  | 'manganese'
  | 'uranium'
  | 'titanium'
  | 'vanadium'
  | 'pgm'
  | 'gold'
  | 'silver'
  | 'zinc'
  | 'tin'
  | 'tungsten'
  | 'niobium'
  | 'tantalum';

export type MineralTextureSpec = {
  slug: MineralTextureSlug;
  usage: string;
  snippet: string;
  prompt: string;
  targetPath: string; // Desired WebP once generated
};

export const MINERAL_TEXTURE_SPECS: MineralTextureSpec[] = [
  {
    slug: 'lithium',
    usage: 'Li brine/pegmatites, battery supply chain, EV narratives',
    snippet: 'spodumene and lithium-bearing pegmatite texture, pale teal and soft lavender accents',
    prompt:
      'Ultra-detailed macro texture of spodumene and lithium-bearing pegmatite, pale teal and soft lavender accents, fine crystalline structure, subtle fractures and veins, dark charcoal background, soft vignette, center gently illuminated, dark cinematic lighting, high-end editorial texture, minimalist, no text',
    targetPath: '/minerals/lithium.webp',
  },
  {
    slug: 'cobalt',
    usage: 'Cobalt supply chain, DRC, battery cathodes',
    snippet: 'cobaltite mineral veins in dark host rock, electric blue highlights',
    prompt:
      'Macro texture of cobaltite mineral veins in dark host rock, electric blue highlights, deep navy shadows, metallic sheen, subtle vignette, center slightly brighter for text, dark cinematic lighting, high-end editorial texture, minimalist, no text',
    targetPath: '/minerals/cobalt.webp',
  },
  {
    slug: 'nickel',
    usage: 'Ni sulphides, ultramafic-hosted deposits, battery alloys',
    snippet: 'pentlandite and pyrrhotite in ultramafic host, muted greenish metallic tones',
    prompt:
      'Macro photograph-style texture of pentlandite and pyrrhotite in ultramafic host rock, muted greenish metallic tones, fine granular texture, dark grey-green background, soft vignette, center illuminated, dark cinematic lighting, high-end editorial texture, minimalist, no text',
    targetPath: '/minerals/nickel.webp',
  },
  {
    slug: 'copper',
    usage: 'Cu porphyry, high-grade veins, infrastructure narratives',
    snippet: 'chalcopyrite and bornite with iridescent copper and purple tones',
    prompt:
      'Detailed macro texture of chalcopyrite and bornite, iridescent copper and purple tones, dark rock matrix, subtle veins and fracture patterns, vignette around edges, center brighter for text, dark cinematic lighting, high-end editorial texture, minimalist, no text',
    targetPath: '/minerals/copper.webp',
  },
  {
    slug: 'ree',
    usage: 'Rare earth elements, carbonatites, critical mineral strategy',
    snippet: 'bastnäsite and monazite in carbonatite, subtle magenta and gold specks',
    prompt:
      'Macro texture of bastnäsite and monazite crystals in carbonatite rock, subtle magenta and gold specks, dark grey-brown background, soft vignette, center glow, dark cinematic lighting, high-end editorial texture, minimalist, no text',
    targetPath: '/minerals/ree.webp',
  },
  {
    slug: 'graphite',
    usage: 'Anode materials, advanced materials, ESG stories',
    snippet: 'graphitic schist with aligned graphite flakes, matte charcoal layers',
    prompt:
      'Ultra-close texture of graphitic schist with aligned graphite flakes, matte charcoal layers, soft linear structure, very dark grey with gentle highlights, vignette edges, central area slightly brighter, dark cinematic lighting, high-end editorial texture, minimalist, no text',
    targetPath: '/minerals/graphite.webp',
  },
  {
    slug: 'manganese',
    usage: 'Battery chemistry, steel/alloy narratives',
    snippet: 'botryoidal manganese oxide, dark purple-black nodules',
    prompt:
      'Macro texture of botryoidal manganese oxide mineralisation, dark purple-black nodules, subtle metallic highlights, deep shadows, soft vignette, central area prepared for text, dark cinematic lighting, high-end editorial texture, minimalist, no text',
    targetPath: '/minerals/manganese.webp',
  },
  {
    slug: 'uranium',
    usage: 'Uranium exploration, nuclear fuel, geopolitics',
    snippet: 'carnotite-stained sandstone, muted yellow-green stains on dark rock',
    prompt:
      'Macro texture of carnotite-stained sandstone, muted yellow-green stains on dark brown rock, subtle layering, soft vignette, center gently illuminated, dark cinematic lighting, high-end editorial texture, minimalist, no text',
    targetPath: '/minerals/uranium.webp',
  },
  {
    slug: 'titanium',
    usage: 'Ilmenite, mineral sands, aerospace materials',
    snippet: 'ilmenite and rutile grains in dark heavy mineral sand',
    prompt:
      'Detailed macro of ilmenite and rutile grains in dark heavy mineral sand, smooth but granular texture, deep cool grey tones with subtle metallic reflections, vignette edges, center ready for text, dark cinematic lighting, high-end editorial texture, minimalist, no text',
    targetPath: '/minerals/titanium.webp',
  },
  {
    slug: 'vanadium',
    usage: 'Vanadium redox flow batteries, steel hardening',
    snippet: 'vanadium-bearing titanomagnetite, cool blue-grey and black intergrowths',
    prompt:
      'Macro texture of vanadium-bearing titanomagnetite ore, cool blue-grey and black intergrowths, subtle metallic shimmer, dark background, soft vignette, center slightly brighter, dark cinematic lighting, high-end editorial texture, minimalist, no text',
    targetPath: '/minerals/vanadium.webp',
  },
  {
    slug: 'pgm',
    usage: 'Platinum group metals, autocatalysts, high-end applications',
    snippet: 'PGM-bearing chromitite, silver-white specks in dark rock',
    prompt:
      'Macro texture of platinum group metals in chromitite, tiny silver-white specks in very dark rock, subtle layered banding, vignette around edges, center illuminated, dark cinematic lighting, high-end editorial texture, minimalist, no text',
    targetPath: '/minerals/pgm.webp',
  },
  {
    slug: 'gold',
    usage: 'Au systems, royalty/streaming, hedging',
    snippet: 'auriferous quartz veins with subtle warm gold highlights',
    prompt:
      'Close-up texture of auriferous quartz veins with subtle warm gold highlights in dark rock, milky quartz ribbons, gentle fractures, soft vignette, center slightly brighter, dark cinematic lighting, high-end editorial texture, minimalist, no text',
    targetPath: '/minerals/gold.webp',
  },
  {
    slug: 'silver',
    usage: 'Silver veins, polymetallic systems, by-product stories',
    snippet: 'silver-rich galena and sphalerite, cool metallic tones',
    prompt:
      'Macro texture of silver-rich galena and sphalerite ore, cool metallic grey and blue tones, fine granular metallic surface, soft vignette, center brightened for text, dark cinematic lighting, high-end editorial texture, minimalist, no text',
    targetPath: '/minerals/silver.webp',
  },
  {
    slug: 'zinc',
    usage: 'Zn-Pb systems, VMS, base metals',
    snippet: 'sphalerite and galena intergrowths, amber and dark grey',
    prompt:
      'Macro texture of sphalerite and galena intergrowths, amber and dark grey colors, compact granular texture, vignette, center highlight, dark cinematic lighting, high-end editorial texture, minimalist, no text',
    targetPath: '/minerals/zinc.webp',
  },
  {
    slug: 'tin',
    usage: 'Tin supply chain, electronics, solder, critical minerals',
    snippet: 'cassiterite crystals in greisen, dark chocolate-brown crystals',
    prompt:
      'Close macro of cassiterite crystals in greisen host, dark chocolate-brown crystals on grey matrix, subtle crystalline reflections, soft vignette, central area brighter, dark cinematic lighting, high-end editorial texture, minimalist, no text',
    targetPath: '/minerals/tin.webp',
  },
  {
    slug: 'tungsten',
    usage: 'W supply, hard metals, drilling tools',
    snippet: 'scheelite and wolframite, cool blue and dark brown contrast',
    prompt:
      'Macro texture of scheelite and wolframite ore, cool blue fluorescence-inspired tones with dark brown-black crystals, fine-grained rock matrix, vignette at edges, center highlight, dark cinematic lighting, high-end editorial texture, minimalist, no text',
    targetPath: '/minerals/tungsten.webp',
  },
  {
    slug: 'niobium',
    usage: 'Nb for high-strength steels, superalloys',
    snippet: 'pyrochlore in carbonatite, subtle tan and dark grey speckles',
    prompt:
      'Macro texture of niobium-bearing pyrochlore in carbonatite, subtle tan and dark grey speckles, soft granular surface, darkened background, gentle vignette, center lit for legible text, dark cinematic lighting, high-end editorial texture, minimalist, no text',
    targetPath: '/minerals/niobium.webp',
  },
  {
    slug: 'tantalum',
    usage: 'Ta for capacitors, electronics, conflict minerals',
    snippet: 'tantalite crystals in dark host rock, deep red-brown fragments',
    prompt:
      'Macro texture of tantalum-bearing tantalite crystals in dark host rock, deep red-brown fragments in very dark matrix, subtle metallic hints, soft vignette, center slightly brighter, dark cinematic lighting, high-end editorial texture, minimalist, no text',
    targetPath: '/minerals/tantalum.webp',
  },
];

const MINERAL_TEXTURE_LOOKUP: Record<MineralTextureSlug, MineralTextureSpec> =
  MINERAL_TEXTURE_SPECS.reduce((acc, spec) => {
    acc[spec.slug] = spec;
    return acc;
  }, {} as Record<MineralTextureSlug, MineralTextureSpec>);

const LEGACY_MINERAL_IMAGES: Record<string, string> = {
  gold: '/minerals/gold.svg',
  copper: '/minerals/copper.svg',
  nickel: '/minerals/nickel.svg',
  lithium: '/minerals/lithium.svg',
  cobalt: '/minerals/cobalt.svg',
  'rare-earth': '/minerals/rare-earth.svg',
  titanium: '/minerals/titanium.svg',
  manganese: '/minerals/manganese.svg',
  chromium: '/minerals/chromium.svg',
  zinc: '/minerals/zinc.svg',
  aluminum: '/minerals/aluminum.svg',
  graphite: '/minerals/graphite.svg',
  silicon: '/minerals/silicon.svg',
  tungsten: '/minerals/tungsten.svg',
  vanadium: '/minerals/vanadium.svg',
  zirconium: '/minerals/zirconium.svg',
  gallium: '/minerals/gallium.svg',
  pgm: '/minerals/pgm.svg',
};

const TEXTURE_PLACEHOLDERS: Record<MineralTextureSlug, string> = Object.entries(
  MINERAL_TEXTURE_LOOKUP,
).reduce((acc, [slug, spec]) => {
  const key = slug as MineralTextureSlug;
  // Use the generated WebP texture from targetPath
  acc[key] = spec.targetPath;
  return acc;
}, {} as Record<MineralTextureSlug, string>);

export const MINERAL_IMAGES: Record<string, string> = {
  ...LEGACY_MINERAL_IMAGES,
  ...TEXTURE_PLACEHOLDERS,
  default: '/minerals/default.webp',
};

function normalizeMineral(mineral: string): string {
  return mineral?.toLowerCase().trim();
}

function isTextureSlug(value: string): value is MineralTextureSlug {
  return Boolean(value && value in MINERAL_TEXTURE_LOOKUP);
}

/**
 * Get the image path for a specific mineral, falling back to default when unknown.
 */
export function getMineralImage(mineral: string): string {
  const normalized = normalizeMineral(mineral);
  return MINERAL_IMAGES[normalized] || MINERAL_IMAGES.default;
}

/**
 * Get a random mineral image path.
 * Useful for decorative elements that don't need specific minerals.
 */
export function getRandomMineralImage(): string {
  const minerals = Object.keys(MINERAL_IMAGES).filter((key) => key !== 'default');
  const randomIndex = Math.floor(Math.random() * minerals.length);
  return MINERAL_IMAGES[minerals[randomIndex]];
}

/**
 * Retrieve the creative brief/spec for a mineral texture slug.
 */
export function getMineralTextureSpec(mineral: string): MineralTextureSpec | undefined {
  const normalized = normalizeMineral(mineral);
  return isTextureSlug(normalized) ? MINERAL_TEXTURE_LOOKUP[normalized] : undefined;
}

/**
 * Preferred final texture path (WebP) for a mineral, if the asset exists.
 * This can be used by automation scripts or OG generators once the pack ships.
 */
export function getPreferredMineralTexture(mineral: string): string | undefined {
  const spec = getMineralTextureSpec(mineral);
  return spec?.targetPath;
}
