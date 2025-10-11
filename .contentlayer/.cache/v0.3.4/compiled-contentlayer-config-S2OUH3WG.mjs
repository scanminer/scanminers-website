// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer/source-files";
import { getPlaiceholder } from "plaiceholder";
import path from "path";
import fs from "fs";
var CaseStudy = defineDocumentType(() => ({
  name: "CaseStudy",
  filePathPattern: `case-studies/**/*.mdx`,
  // Look in the 'case-studies' folder
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    publishedAt: { type: "date", required: true },
    summary: { type: "string", required: true },
    // Add provenance and citations similar to the plan
    provenance: { type: "list", of: { type: "string" }, required: false },
    citations: { type: "list", of: { type: "string" }, required: false },
    tags: { type: "list", of: { type: "string" }, required: false },
    // Re-use the image fields from Insights
    image: { type: "string", required: false },
    imageAlt: { type: "string", required: false }
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.replace("case-studies/", "")
    },
    url: {
      type: "string",
      resolve: (doc) => `/case-studies/${doc._raw.flattenedPath.replace("case-studies/", "")}`
    },
    // Automate blur placeholder generation, same approach as Insights
    imageBlurDataURL: {
      type: "string",
      resolve: async (doc) => {
        if (!doc.image)
          return void 0;
        try {
          const publicRoot = path.join(process.cwd(), "public");
          const rel = doc.image.startsWith("/") ? doc.image : `/${doc.image}`;
          const abs = path.join(publicRoot, rel);
          if (!fs.existsSync(abs))
            return void 0;
          const file = await fs.promises.readFile(abs);
          const { base64 } = await getPlaiceholder(file, { size: 12 });
          return base64;
        } catch {
          return void 0;
        }
      }
    }
  }
}));
var Insight = defineDocumentType(() => ({
  name: "Insight",
  filePathPattern: `insights/**/*.mdx`,
  // Where to find the content files
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    publishedAt: { type: "date", required: true },
    summary: { type: "string", required: true },
    // As per the plan, we include a citations array
    citations: { type: "list", of: { type: "string" }, required: false },
    tags: { type: "list", of: { type: "string" }, required: false },
    image: { type: "string", required: false },
    // e.g. "/images/cover.jpg" under public/
    imageAlt: { type: "string", required: false }
  },
  computedFields: {
    // A slug is a URL-friendly version of the title
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.replace("insights/", "")
    },
    url: {
      type: "string",
      resolve: (doc) => `/insights/${doc._raw.flattenedPath.replace("insights/", "")}`
    },
    imageBlurDataURL: {
      type: "string",
      resolve: async (doc) => {
        if (!doc.image)
          return void 0;
        try {
          const publicRoot = path.join(process.cwd(), "public");
          const rel = doc.image.startsWith("/") ? doc.image : `/${doc.image}`;
          const abs = path.join(publicRoot, rel);
          if (!fs.existsSync(abs))
            return void 0;
          const file = await fs.promises.readFile(abs);
          const { base64 } = await getPlaiceholder(file, { size: 12 });
          return base64;
        } catch {
          return void 0;
        }
      }
    }
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "content",
  // The root folder for all content
  documentTypes: [Insight, CaseStudy],
  // Register both content types
  disableImportAliasWarning: true
});
export {
  CaseStudy,
  Insight,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-S2OUH3WG.mjs.map
