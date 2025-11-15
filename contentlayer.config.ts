import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import { z } from 'zod'
import { getPlaiceholder } from 'plaiceholder'
import path from 'path'
import fs from 'fs'

const commoditySchema = z.union([
  z.string().min(1, 'commodity must be a non-empty string'),
  z.array(z.string().min(1, 'commodity entries must be non-empty')).min(1, 'at least one commodity required'),
])

const brandCategoryOptions = [
  'foundation',
  'messaging',
  'voice',
  'visual',
  'evidence',
  'playbooks',
] as const

const brandAudienceOptions = [
  'executive',
  'geoscience',
  'operations',
  'marketing',
  'sales',
  'public',
] as const

const brandMediumOptions = [
  'website',
  'deck',
  'email',
  'press',
  'sales',
  'product',
] as const

const brandPillarSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  proof: z.string().optional(),
  dos: z.array(z.string()).optional(),
  donts: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
})

const brandExampleSchema = z.object({
  label: z.string().min(2),
  context: z.string().optional(),
  before: z.string().optional(),
  after: z.string().min(5),
  channel: z.string().optional(),
  voiceMove: z.string().optional(),
})

const brandColorSchema = z.object({
  name: z.string().min(2),
  hex: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/),
  role: z.string().optional(),
  usage: z.string().optional(),
  contrastOnLight: z.string().optional(),
  contrastOnDark: z.string().optional(),
})

const brandTypographySchema = z.object({
  family: z.string().min(2),
  role: z.string().optional(),
  fallback: z.string().optional(),
  styles: z
    .array(
      z.object({
        name: z.string(),
        size: z.string().optional(),
        weight: z.string().optional(),
        lineHeight: z.string().optional(),
        letterSpacing: z.string().optional(),
      })
    )
    .optional(),
})

const brandPromptSchema = z.object({
  name: z.string().min(2),
  instructions: z.string().min(10),
  tags: z.array(z.string()).optional(),
  guardrails: z.array(z.string()).optional(),
})

const brandGuardrailSchema = z.object({
  rule: z.string().min(5),
  reason: z.string().optional(),
  severity: z.enum(['hard', 'soft']).optional(),
  appliesTo: z.array(z.string()).optional(),
})

const brandProofSchema = z.object({
  headline: z.string().min(5),
  detail: z.string().min(5),
  metric: z.string().optional(),
  source: z.string().url().optional(),
})

const slugSchema = z.string().min(2, 'slug is required').regex(/^[a-z0-9][a-z0-9-]*$/, 'slug must be kebab-case')

const nonEmptyString = (label: string) => z.string().min(2, `${label} is required`)

const ensureArray = (value: unknown): string[] => {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value as string[]
  return []
}

const estimateReadingMinutes = (raw: string | undefined): number => {
  if (!raw) return 3
  const words = raw.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 190))
}

// Define the schema for a "Brief" document (content/briefs/*.md)
export const Brief = defineDocumentType(() => ({
  name: 'Brief',
  filePathPattern: `briefs/**/*.md`,
  contentType: 'markdown',
  fields: {
    title: { type: 'string', required: false },
    context: { type: 'string', required: false },
    status: {
      type: 'enum',
      options: ['New Brief', 'Generating Draft', 'Draft Ready'],
      required: false,
    },
  },
}));

// Define the schema for a "BrandGuide" document (content/brand/*.mdx)
export const BrandGuide = defineDocumentType(() => ({
  name: 'BrandGuide',
  filePathPattern: `brand/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    slug: {
      type: 'string',
      required: true,
      description: 'Unique identifier for routing within the admin portal.',
      validate: (value: unknown) => slugSchema.parse(value),
    },
    title: {
      type: 'string',
      required: true,
      description: 'Heading used inside the brand book and admin UI.',
      validate: (value: unknown) => nonEmptyString('title').parse(value),
    },
    summary: {
      type: 'string',
      required: true,
      description: 'Short description of what this section covers.',
      validate: (value: unknown) => nonEmptyString('summary').parse(value),
    },
    category: {
      type: 'enum',
      options: [...brandCategoryOptions],
      required: true,
      description: 'Foundational grouping (foundation, messaging, voice, visual, evidence, playbooks).',
    },
    status: {
      type: 'enum',
      options: ['draft', 'approved'],
      required: true,
      description: 'Workflow status; only approved entries flow into AI prompts.',
    },
    weight: {
      type: 'number',
      required: false,
      description: 'Controls sort order within the admin portal.',
    },
    keywords: { type: 'list', of: { type: 'string' }, required: false },
    audience: {
      type: 'list',
      of: {
        type: 'string',
        validate: (value: unknown) => z.enum(brandAudienceOptions).parse(value),
      },
      required: false,
    },
    mediums: {
      type: 'list',
      of: {
        type: 'string',
        validate: (value: unknown) => z.enum(brandMediumOptions).parse(value),
      },
      required: false,
    },
    checklist: { type: 'list', of: { type: 'string' }, required: false },
    pillars: {
      type: 'list',
      of: {
        type: 'json',
        validate: (value: unknown) => brandPillarSchema.parse(value),
      },
      required: false,
    },
    voiceExamples: {
      type: 'list',
      of: {
        type: 'json',
        validate: (value: unknown) => brandExampleSchema.parse(value),
      },
      required: false,
    },
    prompts: {
      type: 'list',
      of: {
        type: 'json',
        validate: (value: unknown) => brandPromptSchema.parse(value),
      },
      required: false,
    },
    guardrails: {
      type: 'list',
      of: {
        type: 'json',
        validate: (value: unknown) => brandGuardrailSchema.parse(value),
      },
      required: false,
    },
    colorPalette: {
      type: 'list',
      of: {
        type: 'json',
        validate: (value: unknown) => brandColorSchema.parse(value),
      },
      required: false,
    },
    typography: {
      type: 'list',
      of: {
        type: 'json',
        validate: (value: unknown) => brandTypographySchema.parse(value),
      },
      required: false,
    },
    proofPoints: {
      type: 'list',
      of: {
        type: 'json',
        validate: (value: unknown) => brandProofSchema.parse(value),
      },
      required: false,
    },
    heroTagline: { type: 'string', required: false },
    elevatorPitch: { type: 'string', required: false },
    sampleQuestions: { type: 'list', of: { type: 'string' }, required: false },
    updatedBy: { type: 'string', required: false },
    updatedAt: { type: 'date', required: false },
  },
  computedFields: {
    isApproved: {
      type: 'boolean',
      resolve: (doc) => doc.status === 'approved',
    },
    adminPath: {
      type: 'string',
      resolve: (doc) => `/admin/brand/${doc.slug}`,
    },
    topics: {
      type: 'json',
      resolve: (doc) => ({
        category: doc.category,
        keywords: doc.keywords ?? [],
        audience: doc.audience ?? [],
        mediums: doc.mediums ?? [],
      }),
    },
  },
}))

// Define the schema for a "CaseStudy" document
export const CaseStudy = defineDocumentType(() => ({
  name: 'CaseStudy',
  filePathPattern: `case-studies/**/*.mdx`, // Look in the 'case-studies' folder
  contentType: 'mdx',
  fields: {
    slug: {
      type: 'string',
      required: true,
      validate: (value: unknown) => slugSchema.parse(value),
    },
    title: {
      type: 'string',
      required: true,
  validate: (value: unknown) => z.string().max(70).parse(value),
    },
    publishedAt: { type: 'date', required: true },
    region: {
      type: 'string',
      required: true,
      validate: (value: unknown) => nonEmptyString('region').parse(value),
    },
    summary: {
      type: 'string',
      required: true,
  validate: (value: unknown) => z.string().min(50).max(160).parse(value),
    },
    commodity: {
      type: 'json',
      required: true,
      validate: (value: unknown) => commoditySchema.parse(value),
    },
    // Add provenance and citations similar to the plan
    provenance: { type: 'list', of: { type: 'string' }, required: false },
    citations: { type: 'list', of: { type: 'string' }, required: false },
    // Structured citations (new)
    citationsRich: {
      type: 'list',
      of: {
        type: 'json',
        validate: (value: unknown) => z.array(z.object({
          title: z.string(),
          url: z.string().url(),
          accessed: z.string().datetime(),
        })).optional().parse(value),
      },
      required: false,
    },
    tags: { type: 'list', of: { type: 'string' }, required: true },
    // Re-use the image fields from Insights
    image: { type: 'string', required: true },
    imageAlt: { type: 'string', required: false },
    imagePrompt: {
      type: 'string',
      required: true,
      validate: (value: unknown) => nonEmptyString('imagePrompt').parse(value),
    },
    imageMineral: {
      type: 'string',
      required: false,
      description: 'Optional mineral image to use as background (e.g., "gold", "copper", "lithium")',
    },
    // New moderation/AI flags
    review_status: {
      type: 'enum',
      options: ['needs-review', 'approved'],
      required: true,
  validate: (value: unknown) => z.enum(['needs-review', 'approved']).parse(value),
    },
    ai_generated: { type: 'boolean', default: false },
    coverImage: { type: 'string', required: false },
    images: {
      type: 'list',
      of: {
        type: 'json',
        validate: (value: unknown) => z.array(z.object({
          src: z.string().url(),
          alt: z.string(),
          caption: z.string().optional(),
          license: z.string().optional(),
        })).optional().parse(value),
      },
      required: false,
    },
    // Publishing workflow fields
    status: {
      type: 'enum',
      options: ['draft', 'review', 'scheduled', 'published'],
      required: false,
      default: 'published',
      description: 'Publication status for editorial workflow',
    },
    publishAt: {
      type: 'date',
      required: false,
      description: 'Scheduled publication date (ISO string)',
    },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (doc) => `/case-studies/${doc.slug}`,
    },
    commodities: {
      type: 'json',
      resolve: (doc) => ensureArray((doc as { commodity: unknown }).commodity),
    },
    readingTimeMinutes: {
      type: 'number',
      resolve: (doc) => estimateReadingMinutes(doc.body?.raw),
    },
    // Automate blur placeholder generation, same approach as Insights
    imageBlurDataURL: {
      type: 'string',
      resolve: async (doc) => {
        if (!doc.image) return undefined as unknown as string;
        try {
          const publicRoot = path.join(process.cwd(), 'public');
          const rel = doc.image.startsWith('/') ? doc.image : `/${doc.image}`;
          const abs = path.join(publicRoot, rel);
          if (!fs.existsSync(abs)) return undefined as unknown as string;
          const file = await fs.promises.readFile(abs);
          const { base64 } = await getPlaiceholder(file, { size: 12 });
          return base64;
        } catch {
          return undefined as unknown as string;
        }
      },
    },
  },
}));

// Define the schema for an "Insight" document
export const Insight = defineDocumentType(() => ({
  name: 'Insight',
  filePathPattern: `insights/**/*.mdx`, // Where to find the content files
  contentType: 'mdx',
  fields: {
    slug: {
      type: 'string',
      required: true,
      validate: (value: unknown) => slugSchema.parse(value),
    },
    title: {
      type: 'string',
      required: true,
  validate: (value: unknown) => z.string().max(70).parse(value),
    },
    publishedAt: { type: 'date', required: true },
    region: {
      type: 'string',
      required: true,
      validate: (value: unknown) => nonEmptyString('region').parse(value),
    },
    summary: {
      type: 'string',
      required: true,
  validate: (value: unknown) => z.string().min(50).max(160).parse(value),
    },
    commodity: {
      type: 'json',
      required: true,
      validate: (value: unknown) => commoditySchema.parse(value),
    },
    // As per the plan, we include a citations array
    citations: { type: 'list', of: { type: 'string' }, required: false },
    // Structured citations (new)
    citationsRich: {
      type: 'list',
      of: {
        type: 'json',
        validate: (value: unknown) => z.array(z.object({
          title: z.string(),
          url: z.string().url(),
          accessed: z.string().datetime(),
        })).optional().parse(value),
      },
      required: false,
    },
    tags: { type: 'list', of: { type: 'string' }, required: true },
    image: { type: 'string', required: true }, // e.g. "/images/cover.jpg" under public/
    imageAlt: { type: 'string', required: false },
    imagePrompt: {
      type: 'string',
      required: true,
      validate: (value: unknown) => nonEmptyString('imagePrompt').parse(value),
    },
    imageMineral: {
      type: 'string',
      required: false,
      description: 'Optional mineral image to use as background (e.g., "gold", "copper", "lithium")',
    },
    // New moderation/AI flags and richer media
    review_status: {
      type: 'enum',
      options: ['needs-review', 'approved'],
      required: true,
  validate: (value: unknown) => z.enum(['needs-review', 'approved']).parse(value),
    },
    ai_generated: { type: 'boolean', default: false },
    coverImage: { type: 'string', required: false },
    images: {
      type: 'list',
      of: {
        type: 'json',
        validate: (value: unknown) => z.array(z.object({
          src: z.string().url(),
          alt: z.string(),
          caption: z.string().optional(),
          license: z.string().optional(),
        })).optional().parse(value),
      },
      required: false,
    },
    // Publishing workflow fields
    status: {
      type: 'enum',
      options: ['draft', 'review', 'scheduled', 'published'],
      required: false,
      default: 'published',
      description: 'Publication status for editorial workflow',
    },
    publishAt: {
      type: 'date',
      required: false,
      description: 'Scheduled publication date (ISO string)',
    },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (doc) => `/insights/${doc.slug}`,
    },
    commodities: {
      type: 'json',
      resolve: (doc) => ensureArray((doc as { commodity: unknown }).commodity),
    },
    readingTimeMinutes: {
      type: 'number',
      resolve: (doc) => estimateReadingMinutes(doc.body?.raw),
    },
    imageBlurDataURL: {
      type: 'string',
      resolve: async (doc) => {
        if (!doc.image) return undefined as unknown as string;
        try {
          const publicRoot = path.join(process.cwd(), 'public');
          const rel = doc.image.startsWith('/') ? doc.image : `/${doc.image}`;
          const abs = path.join(publicRoot, rel);
          if (!fs.existsSync(abs)) return undefined as unknown as string;
          const file = await fs.promises.readFile(abs);
          const { base64 } = await getPlaiceholder(file, { size: 12 });
          return base64;
        } catch {
          return undefined as unknown as string;
        }
      }
    }
  },
}));

export default makeSource({
  contentDirPath: 'content', // The root folder for all content
  documentTypes: [Insight, CaseStudy, Brief, BrandGuide],   // Register all content types
  disableImportAliasWarning: true,
});