import type { Metadata } from "next";
import { allInsights } from "contentlayer/generated";
import { absoluteUrl } from "@/lib/url";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug: s } = params;
  const post = allInsights.find((p: { slug: string }) => p.slug === s);
  const title = post?.title ?? "Insight";
  const description = post?.summary ?? undefined;
  const url = absoluteUrl(`/insights/${s}`);
  const defaultOg = absoluteUrl("/og-default.svg");
  const images = post?.image
    ? [{ url: absoluteUrl(post.image), alt: post.imageAlt || post.title }]
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
