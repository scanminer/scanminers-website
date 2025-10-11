import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import { getPlaiceholder } from 'plaiceholder'
import path from 'path'
import fs from 'fs'

// Define the schema for an "Insight" document
export const Insight = defineDocumentType(() => ({
  name: 'Insight',
  filePathPattern: `insights/**/*.mdx`, // Where to find the content files
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    publishedAt: { type: 'date', required: true },
    summary: { type: 'string', required: true },
    // As per the plan, we include a citations array
    citations: { type: 'list', of: { type: 'string' }, required: false },
    tags: { type: 'list', of: { type: 'string' }, required: false },
    image: { type: 'string', required: false }, // e.g. "/images/cover.jpg" under public/
    imageAlt: { type: 'string', required: false },
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
  documentTypes: [Insight],   // The list of all your content types
  disableImportAliasWarning: true,
});