import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import { z } from 'zod'
import { getPlaiceholder } from 'plaiceholder'
import path from 'path'
import fs from 'fs'

// Define the schema for a "Brief" document (content/briefs/*.md)
export const Brief = defineDocumentType(() => ({
  name: 'Brief',
  filePathPattern: `briefs/**/*.md`,
  contentType: 'markdown',
  fields: {
    slug: { type: 'string', required: false },
    title: { type: 'string', required: false },
    context: { type: 'string', required: false },
    status: {
      type: 'enum',
      options: ['New Brief', 'Generating Draft', 'Draft Ready'],
      required: false,
    },
  },
}));

// Define the schema for a "CaseStudy" document
export const CaseStudy = defineDocumentType(() => ({
  name: 'CaseStudy',
  filePathPattern: `case-studies/**/*.mdx`, // Look in the 'case-studies' folder
  contentType: 'mdx',
  fields: {
    title: {
      type: 'string',
      required: true,
  validate: (value: unknown) => z.string().max(70).parse(value),
    },
    publishedAt: { type: 'date', required: true },
    summary: {
      type: 'string',
      required: true,
  validate: (value: unknown) => z.string().min(50).max(160).parse(value),
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
    tags: { type: 'list', of: { type: 'string' }, required: false },
    // Re-use the image fields from Insights
    image: { type: 'string', required: false },
    imageAlt: { type: 'string', required: false },
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
    // Optional SEO metadata block
    seo: {
      type: 'json',
      required: false,
      validate: (value: unknown) => z.object({
        meta_title: z.string().max(70).optional(),
        meta_description: z.string().max(160).optional(),
        keywords: z.array(z.string()).optional(),
      }).optional().parse(value),
    },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace('case-studies/', ''),
    },
    url: {
      type: 'string',
      resolve: (doc) => `/case-studies/${doc._raw.flattenedPath.replace('case-studies/', '')}`,
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
    title: {
      type: 'string',
      required: true,
  validate: (value: unknown) => z.string().max(70).parse(value),
    },
    publishedAt: { type: 'date', required: true },
    summary: {
      type: 'string',
      required: true,
  validate: (value: unknown) => z.string().min(50).max(160).parse(value),
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
    tags: { type: 'list', of: { type: 'string' }, required: false },
    image: { type: 'string', required: false }, // e.g. "/images/cover.jpg" under public/
    imageAlt: { type: 'string', required: false },
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
  },
  computedFields: {
    // A slug is a URL-friendly version of the title
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace('insights/', ''),
    },
    url: {
      type: 'string',
      resolve: (doc) => `/insights/${doc._raw.flattenedPath.replace('insights/', '')}`,
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
  documentTypes: [Insight, CaseStudy, Brief],   // Register all content types
  disableImportAliasWarning: true,
});