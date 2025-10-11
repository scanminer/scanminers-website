import type { MetadataRoute } from "next";
import { allInsights, allCaseStudies } from "contentlayer/generated";
import { absoluteUrl } from "@/lib/url";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/technologies"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/insights"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/case-studies"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  const insightRoutes: MetadataRoute.Sitemap = allInsights.map((p) => ({
    url: absoluteUrl(p.url),
    lastModified: new Date(p.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const caseStudyRoutes: MetadataRoute.Sitemap = allCaseStudies.map((p) => ({
    url: absoluteUrl(p.url),
    lastModified: new Date(p.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...insightRoutes, ...caseStudyRoutes];
}
