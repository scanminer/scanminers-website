// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer/source-files";
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
    citations: { type: "list", of: { type: "string" }, required: false }
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
    }
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "content",
  // The root folder for all content
  documentTypes: [Insight]
  // The list of all your content types
});
export {
  Insight,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-RQVOJULW.mjs.map
