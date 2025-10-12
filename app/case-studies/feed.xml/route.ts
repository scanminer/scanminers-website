import { NextResponse } from "next/server";
import RSS from "rss";
import { allCaseStudies } from "contentlayer/generated";
import { absoluteUrl } from "@/lib/url";

export const revalidate = 3600; // revalidate hourly

export async function GET() {
  const feed = new RSS({
    title: "Scanminers Case Studies",
    description: "Case studies from Scanminers",
    site_url: absoluteUrl("/case-studies"),
    feed_url: absoluteUrl("/case-studies/feed.xml"),
    language: "en",
  });

  const posts = [...allCaseStudies].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  posts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.summary,
      url: absoluteUrl(post.url),
      date: new Date(post.publishedAt),
      guid: post.url,
    });
  });

  const xml = feed.xml({ indent: true });
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
