import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Satellite, LineChart, Layers, MapPin, Leaf } from "lucide-react";
import { HeroVisual } from "@/components/HeroVisual";
import { ProspectivityPipeline } from "@/components/ProspectivityPipeline";
import { ProductScreensStrip } from "@/components/ProductScreensStrip";
import { absoluteUrl } from "@/lib/url";

export const metadata: Metadata = {
  title: "Technologies | Scanminers",
  description: "How Scanminers' GeoAI platform finds critical mineral potential using multi-sensor fusion and explainable AI.",
  alternates: { canonical: absoluteUrl("/technologies") },
  openGraph: {
    title: "Technologies | Scanminers",
    description: "Multi-sensor fusion and explainable AI for critical mineral exploration.",
    url: absoluteUrl("/technologies"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Technologies | Scanminers",
    description: "Multi-sensor fusion and explainable AI for critical mineral exploration.",
  },
};

export default function TechnologiesPage() {
  const dataSources = [
    {
      icon: Satellite,
      name: "Optical Satellite",
      examples: "Sentinel-2, Landsat 8/9",
      description: "Multispectral imaging for mineral mapping and alteration detection",
    },
    {
      icon: LineChart,
      name: "Hyperspectral",
      examples: "PRISMA, EnMAP",
      description: "High-resolution spectroscopy for precise mineralogical signatures",
    },
    {
      icon: Layers,
      name: "DEM & Topography",
      examples: "SRTM, ASTER GDEM",
      description: "Elevation, slope, aspect for structural geology analysis",
    },
    {
      icon: MapPin,
      name: "Geochemistry",
      examples: "Stream sediments, soil samples",
      description: "Ground-truth elemental concentrations and pathfinder elements",
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 lg:py-20">
      {/* Hero Section */}
      <section className="mb-16 lg:mb-24">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
              How Scanminers&apos; GeoAI Finds Critical Mineral Potential
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              We combine multi-sensor remote sensing data with explainable machine learning to deliver
              prospectivity maps that are <strong>accurate, transparent, and actionable</strong>.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Better targeting → fewer blind exploration holes",
                "Explainable AI → understand why a target ranks high",
                "SDG-aligned exploration → minimize environmental footprint",
              ].map((outcome) => (
                <li key={outcome} className="flex items-start gap-2 text-muted-foreground">
                  <ArrowRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/prospectivity-brief"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
              >
                Request Prospectivity Brief
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/case-studies"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-6 py-3 text-sm font-semibold shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                View Case Studies
              </Link>
            </div>
          </div>
          
          <HeroVisual variant="compact" />
        </div>
      </section>

      {/* Multi-Sensor Fusion */}
      <section className="mb-16 lg:mb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Multi-Sensor Fusion
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Scanminers integrates diverse geospatial and geochemical datasets to create a comprehensive
            picture of mineral potential. Each data source reveals different aspects of the subsurface.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {dataSources.map((source) => {
            const Icon = source.icon;
            return (
              <div
                key={source.name}
                className="rounded-xl border border-border/70 bg-card/60 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <Icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{source.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{source.examples}</p>
                <p className="text-sm text-muted-foreground">{source.description}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-border/70 bg-muted/30 p-6 lg:p-8">
          <h3 className="text-xl font-semibold mb-3">What &quot;Fusion&quot; Actually Means</h3>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-muted-foreground">
              Data fusion isn&apos;t just stacking rasters. We engineer features from each sensor type—spectral indices,
              topographic derivatives, geochemical pathfinder ratios—then combine them into a unified feature space.
              This allows machine learning models to discover cross-sensor patterns that no single dataset reveals alone.
            </p>
            <p className="text-muted-foreground">
              For example: high SWIR alteration (hyperspectral) + elevated Cu in stream sediments (geochem) + 
              structural lineaments (DEM) = a prospective porphyry target.
            </p>
          </div>
        </div>
      </section>

      {/* Explainable AI */}
      <section className="mb-16 lg:mb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Explainable AI
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We don&apos;t just tell you <em>where</em> to explore—we show you <strong>why</strong>.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-start mb-8">
          <div>
            <h3 className="text-2xl font-semibold mb-4">XGBoost + Random Forest + SHAP</h3>
            <div className="prose prose-slate dark:prose-invert">
              <p className="text-muted-foreground">
                Our models use <strong>gradient boosted trees</strong> (XGBoost) and <strong>random forests</strong>—proven
                workhorses in geoscience ML. But we go further: every prediction is accompanied by{" "}
                <strong>SHAP (SHapley Additive exPlanations)</strong> values.
              </p>
              <p className="text-muted-foreground">
                SHAP reveals which features pushed a target&apos;s score higher or lower. For executives, this means confidence.
                For geoscientists, this means actionable insight. For compliance, this means auditability.
              </p>
            </div>
            <div className="mt-6 rounded-lg border border-emerald-200/50 bg-emerald-50/50 dark:border-emerald-800/50 dark:bg-emerald-950/30 p-4">
              <p className="text-sm text-emerald-900 dark:text-emerald-100">
                <strong>No black boxes.</strong> Every high-ranking target comes with a feature importance breakdown
                so you can validate the model&apos;s reasoning against your geological understanding.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-6">
            <h3 className="text-lg font-semibold mb-4">Product Views</h3>
            <ProductScreensStrip />
          </div>
        </div>
      </section>

      {/* Prospectivity Workflow */}
      <section className="mb-16 lg:mb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            End-to-End Prospectivity Workflow
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            From raw data ingestion to drill-ready targets, our pipeline is systematic, reproducible, and transparent.
          </p>
        </div>

        <ProspectivityPipeline />

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Each step is documented, version-controlled, and auditable for regulatory and ESG reporting.
          </p>
        </div>
      </section>

      {/* Sustainability & SDG 13 */}
      <section className="mb-16">
        <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-emerald-50/50 to-sky-50/50 dark:from-emerald-950/20 dark:to-sky-950/20 p-8 lg:p-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="rounded-full bg-emerald-500 p-3">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                Sustainability & SDG 13
              </h2>
              <p className="text-lg text-muted-foreground">
                Climate Action Through Smarter Exploration
              </p>
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-muted-foreground">
              Better targeting means <strong>fewer drill pads</strong>, <strong>less land disturbance</strong>, and{" "}
              <strong>reduced carbon emissions</strong> from exploration logistics. When you drill smarter, not more,
              you advance both mineral security and climate goals.
            </p>
            <p className="text-muted-foreground">
              Scanminers&apos; approach aligns with <strong>UN SDG 13 (Climate Action)</strong> by enabling more
              efficient resource discovery—critical for the energy transition without sacrificing environmental integrity.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="rounded-lg border border-border/70 bg-card/80 px-4 py-2">
                <p className="text-sm font-semibold">Fewer drill holes</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-card/80 px-4 py-2">
                <p className="text-sm font-semibold">Lower emissions</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-card/80 px-4 py-2">
                <p className="text-sm font-semibold">Responsible discovery</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border/70 bg-card p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Ready to See How It Works?</h2>
          <p className="text-muted-foreground mb-6">
            Explore our case studies to see real-world applications, or request a custom prospectivity brief
            for your area of interest.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/prospectivity-brief"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Request Prospectivity Brief
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/case-studies"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-6 py-3 text-sm font-semibold shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              View Case Studies
            </Link>
            <Link
              href="/insights"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-6 py-3 text-sm font-semibold shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Read Insights
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
