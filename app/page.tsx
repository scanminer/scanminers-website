import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/url";
import type { Insight, CaseStudy } from "contentlayer/generated";
import { allInsights, allCaseStudies } from "contentlayer/generated";
import { formatDate } from "@/lib/date";

export default function Home() {
  const latestInsights: Insight[] = allInsights
    .slice()
    .sort((a: Insight, b: Insight) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);

  const latestCaseStudies: CaseStudy[] = allCaseStudies
    .slice()
    .sort((a: CaseStudy, b: CaseStudy) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);

  return (
    <main className="min-h-screen p-8 pb-20 sm:p-20">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <section className="py-8 sm:py-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">AI-Powered Mineral Prospectivity Mapping for the Critical Materials Transition</h1>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">We fuse remote sensing, geophysics, geochemistry, and geology with AI to reveal high-potential zones of critical minerals—at regional to global scale.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
              Request a Prospectivity Demo
            </Link>
            <Link href="/case-studies" className="px-4 py-2 rounded-md border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10">
              See Case Studies
            </Link>
          </div>
        </section>

        {/* Why Now */}
        <section className="py-8 sm:py-12 border-t border-black/10 dark:border-white/10">
          <h2 className="text-2xl font-semibold">Why Now</h2>
          <div className="mt-4 space-y-3 text-gray-700 dark:text-gray-300">
            <p>Energy-transition demand lifted lithium materially in 2024; nickel, cobalt, graphite, and rare earths also grew.</p>
            <p>Supply concentration and export controls keep risks elevated.</p>
            <p>Faster targeting · Lower cost per discovery · Smaller environmental footprint</p>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-8 sm:py-12 border-t border-black/10 dark:border-white/10">
          <h2 className="text-2xl font-semibold">How It Works</h2>
          <ol className="mt-4 list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Ingest & Harmonize</strong> — Landsat/ASTER/PRISMA/EMIT + PALSAR; radiometric/atmospheric correction (QUAC/Log-Residual/IARR), NDVI mask, MNF denoising.</li>
            <li><strong>AI & Statistical Fusion</strong> — DPCA, AIG-DHA, MF/ANN; ALE & FPCS for structure; <strong>AHP</strong> for transparent weighting.</li>
            <li><strong>Rank & Validate</strong> — Prospectivity tiers, uncertainty layers, coordinates for field checks within <strong>500–1000 m</strong> buffers.</li>
          </ol>
        </section>

        {/* Latest Content */}
        <section className="py-8 sm:py-12 border-t border-black/10 dark:border-white/10">
          <h2 className="text-2xl font-semibold mb-4">Latest Case Studies</h2>
          {latestCaseStudies.length === 0 ? (
            <p className="text-gray-600">No case studies yet.</p>
          ) : (
            <ul className="space-y-6">
              {latestCaseStudies.map((s) => (
                <li key={s._id} className="border-b pb-4">
                  <Link href={s.url} className="group">
                    <h3 className="text-xl font-semibold group-hover:text-blue-600">{s.title}</h3>
                  </Link>
                  <time className="block text-sm text-gray-500 mt-1">{formatDate(s.publishedAt)}</time>
                  {s.summary && <p className="mt-2 text-gray-700 dark:text-gray-300">{s.summary}</p>}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4">
            <Link href="/case-studies" className="text-blue-600 hover:underline">See all case studies →</Link>
          </div>
        </section>

        <section className="py-8 sm:py-12 border-t border-black/10 dark:border-white/10">
          <h2 className="text-2xl font-semibold mb-4">Latest Insights</h2>
          {latestInsights.length === 0 ? (
            <p className="text-gray-600">No insights yet.</p>
          ) : (
            <ul className="space-y-6">
              {latestInsights.map((p: Insight) => (
                <li key={p._id} className="border-b pb-4">
                  <Link href={p.url} className="group">
                    <h3 className="text-xl font-semibold group-hover:text-blue-600">{p.title}</h3>
                  </Link>
                  <time className="block text-sm text-gray-500 mt-1">{formatDate(p.publishedAt)}</time>
                  {p.summary && <p className="mt-2 text-gray-700 dark:text-gray-300">{p.summary}</p>}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4">
            <Link href="/insights" className="text-blue-600 hover:underline">See all insights →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export const metadata: Metadata = {
  title: "AI-Powered Mineral Prospectivity Mapping | Scanminers",
  description:
    "We fuse remote sensing, geophysics, geochemistry, and geology with AI to reveal high-potential zones of critical minerals—at regional to global scale.",
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: "AI-Powered Mineral Prospectivity Mapping | Scanminers",
    description:
      "We fuse remote sensing, geophysics, geochemistry, and geology with AI to reveal high-potential zones of critical minerals—at regional to global scale.",
    url: absoluteUrl("/"),
    type: "website",
    images: [{ url: absoluteUrl("/og-default.svg") }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI-Powered Mineral Prospectivity Mapping | Scanminers",
    description:
      "We fuse remote sensing, geophysics, geochemistry, and geology with AI to reveal high-potential zones of critical minerals—at regional to global scale.",
    images: [absoluteUrl("/og-default.svg")],
  },
};
