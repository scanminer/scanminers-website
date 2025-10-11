import type { Metadata } from "next";
import { allCaseStudies } from "contentlayer/generated";
import { absoluteUrl } from "@/lib/url";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }): Promise<Metadata> {
  const maybeThen = (params as { then?: unknown }).then;
  const { slug: s } = typeof maybeThen === 'function' ? await (params as Promise<{ slug: string }>) : (params as { slug: string });
  const study = allCaseStudies.find((p: { slug: string }) => p.slug === s);
  const title = study?.title ?? "Case Study";
  const description = study?.summary ?? undefined;
  const url = absoluteUrl(`/case-studies/${s}`);
  const defaultOg = absoluteUrl("/og-default.svg");
  const images = study?.image
    ? [{ url: absoluteUrl(study.image), alt: study.imageAlt || study.title }]
    : [{ url: defaultOg }];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article", images },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images?.map((i: { url: string } | string) => (typeof i === 'string' ? i : i.url)),
    },
  };
}
