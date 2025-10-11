import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/url";

export const metadata: Metadata = {
  title: "Technologies | Scanminers",
  description:
    "How Scanminers fuses remote sensing, geophysics, geochemistry, and geology with AI to prioritize high-probability mineral targets.",
  alternates: { canonical: absoluteUrl("/technologies") },
  openGraph: {
    title: "Technologies | Scanminers",
    description:
      "How Scanminers fuses remote sensing, geophysics, geochemistry, and geology with AI to prioritize high-probability mineral targets.",
    url: absoluteUrl("/technologies"),
    type: "website",
    images: [{ url: absoluteUrl("/og-default.svg") }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Technologies | Scanminers",
    description:
      "How Scanminers fuses remote sensing, geophysics, geochemistry, and geology with AI to prioritize high-probability mineral targets.",
    images: [absoluteUrl("/og-default.svg")],
  },
};

export default function TechnologiesPage() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <main className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Technologies</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-8">
          We operationalize a modern, transparent workflow to accelerate mineral discovery: ingest and harmonize multisensor data, 
          apply AI and statistical fusion with interpretable weighting, then rank and validate targets with uncertainty measures and coordinates for field checks.
        </p>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">Ingest & Harmonize</h2>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            Landsat, ASTER, PRISMA, EMIT and PALSAR are harmonized via radiometric and atmospheric correction (QUAC, Log-Residual, IARR),
            vegetation masking (NDVI), and denoising (MNF). This produces consistent inputs across sensors and seasons, enabling robust spectral and structural analysis
            at regional to global scales.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">AI & Statistical Fusion</h2>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            We combine Directed PCA (DPCA), AIG-DHA, and matched filtering (MF/ANN) to surface mineralogical signatures, while ALE and FPCS extract structural features.
            Evidence layers are weighted using the Analytic Hierarchy Process (AHP) for transparent, defensible decision-making that domain experts can audit and adjust.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Rank & Validate</h2>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            Outputs include prospectivity tiers with uncertainty layers and prioritized coordinates for field verification within 500–1000 m buffers.
            This reduces cost per discovery and shortens cycle time while minimizing environmental footprint.
          </p>
        </section>
      </main>
    </div>
  );
}
