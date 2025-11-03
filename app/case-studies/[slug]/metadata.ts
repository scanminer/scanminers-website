import type { Metadata } from "next";
import { allCaseStudies } from "contentlayer/generated";
import fs from "fs";
import path from "path";
import { absoluteUrl } from "@/lib/url";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }): Promise<Metadata> {
  const maybeThen = (params as { then?: unknown }).then;
  const { slug: s } = typeof maybeThen === 'function' ? await (params as Promise<{ slug: string }>) : (params as { slug: string });
  const study = allCaseStudies.find((p: { slug: string }) => p.slug === s);
  const title = study?.title ?? "Case Study";
  const description = study?.summary ?? undefined;
  const url = absoluteUrl(`/case-studies/${s}`);
  const defaultOg = absoluteUrl("/og-default.svg");
  const ogCandidate = `/images/og/${s}.png`;
  const ogAbs = path.join(process.cwd(), 'public', ogCandidate);
  const hasOg = fs.existsSync(ogAbs);
  const imageUrl = hasOg ? absoluteUrl(ogCandidate) : (study?.image ? absoluteUrl(study.image) : defaultOg);
  const altText = `${title} — Scanminers`;
  const images = hasOg
    ? [{ url: imageUrl, width: 1920, height: 1080, alt: altText }]
    : (study?.image
        ? [{ url: imageUrl, alt: study.imageAlt || study.title }]
        : [{ url: imageUrl }]);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article", publishedTime: (study?.publishedAt as unknown as string | undefined), images },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
