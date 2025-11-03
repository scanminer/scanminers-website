import type { Metadata } from "next";
import { allInsights } from "contentlayer/generated";
import fs from "fs";
import path from "path";
import { absoluteUrl } from "@/lib/url";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug: s } = await params;
  const post = allInsights.find((p: { slug: string }) => p.slug === s);
  const title = post?.title ?? "Insight";
  const description = post?.summary ?? undefined;
  const url = absoluteUrl(`/insights/${s}`);
  const defaultOg = absoluteUrl("/og-default.svg");
  const ogCandidate = `/images/og/${s}.png`;
  const ogAbs = path.join(process.cwd(), 'public', ogCandidate);
  const hasOg = fs.existsSync(ogAbs);
  const imageUrl = hasOg ? absoluteUrl(ogCandidate) : (post?.image ? absoluteUrl(post.image) : defaultOg);
  const altText = `${title} — Scanminers`;
  const images = hasOg
    ? [{ url: imageUrl, width: 1920, height: 1080, alt: altText }]
    : (post?.image
        ? [{ url: imageUrl, alt: post.imageAlt || post?.title }]
        : [{ url: imageUrl }]);
  return {
    title,
    description,
    alternates: { canonical: url },
  openGraph: { title, description, url, type: "article", publishedTime: (post?.publishedAt as unknown as string | undefined), images },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
