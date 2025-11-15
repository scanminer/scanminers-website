import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Satellite, LineChart, Layers, MapPin, Leaf } from "lucide-react";
import { HeroVisual } from "@/components/HeroVisual";
import { ProspectivityPipeline } from "@/components/ProspectivityPipeline";
import { ProductScreensStrip } from "@/components/ProductScreensStrip";
import { TechnologiesPipelineDiagram } from "@/components/TechnologiesPipelineDiagram";
import { absoluteUrl } from "@/lib/url";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-12 lg:py-20">
      {/* Hero Section */}
      <section className="mb-16 lg:mb-24">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Technologies
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
              How Scanminers&apos; GeoAI <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">finds critical mineral potential</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              We combine multi-sensor remote sensing data with explainable machine learning to deliver
              prospectivity maps that are <strong className="text-fg">accurate, transparent, and actionable</strong>.
            </p>
            
            {/* Key Outcomes - Box Style */}
            <div className="rounded-2xl border-2 border-success/30 bg-gradient-to-br from-success/10 via-success/5 to-transparent p-6 mb-8 shadow-inner">
              <h3 className="text-sm font-bold uppercase tracking-wider text-success mb-4">
                Key Outcomes
              </h3>
              <ul className="space-y-3">
                {[
                  "Better targeting → fewer blind exploration holes",
                  "Explainable AI → understand why a target ranks high",
                  "SDG-aligned exploration → minimize environmental footprint",
                ].map((outcome) => (
                  <li key={outcome} className="flex items-start gap-2 text-fg">
                    <ArrowRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="primary" className="shadow-xl hover:shadow-2xl">
                <Link href="/prospectivity-brief" className="inline-flex items-center gap-2">
                  Request Prospectivity Brief
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/case-studies">
                  View Case Studies
                </Link>
              </Button>
            </div>
          </div>
          
          <HeroVisual variant="compact" />
        </div>
      </section>

      {/* Multi-Sensor Fusion */}
      <section className="mb-16 lg:mb-24">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Multi-Sensor Fusion
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Integrating <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">diverse geospatial datasets</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Scanminers integrates diverse geospatial and geochemical datasets to create a <strong className="text-fg">comprehensive
            picture of mineral potential</strong>. Each data source reveals different aspects of the subsurface.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {dataSources.map((source, idx) => {
            const Icon = source.icon;
            return (
              <div
                key={source.name}
                className="group relative rounded-2xl border border-border/70 bg-gradient-to-br from-card/60 via-card/40 to-background p-6 shadow-sm transition hover:border-primary/50 hover:shadow-xl"
              >
                <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-earth/10 text-sm font-bold text-earth">
                  {idx + 1}
                </div>
                <Icon className="h-10 w-10 text-primary mb-3" />
                <h3 className="font-bold mb-1">{source.name}</h3>
                <p className="text-xs text-muted mb-2 font-semibold">{source.examples}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{source.description}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border bg-gradient-to-br from-card via-card/50 to-background p-8 shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-base font-bold text-accent">
              ?
            </span>
            What &quot;Fusion&quot; Actually Means
          </h3>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Data fusion isn&apos;t just stacking rasters. We engineer <strong className="text-fg">features from each sensor type</strong>—spectral indices,
            topographic derivatives, geochemical pathfinder ratios—then combine them into a unified feature space.
            This allows machine learning models to discover <strong className="text-fg">cross-sensor patterns</strong> that no single dataset reveals alone.
          </p>
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
            <p className="text-sm text-fg leading-relaxed">
              <strong className="text-accent">For example:</strong> high SWIR alteration (hyperspectral) + elevated Cu in stream sediments (geochem) + 
              structural lineaments (DEM) = <strong className="text-accent">a prospective porphyry target</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Explainable AI */}
      <section className="mb-16 lg:mb-24">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Explainable AI
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            We don&apos;t just tell you <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">where</span> to explore—we show you <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">why</span>
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-start mb-8">
          {/* Left: Explanation */}
          <div className="rounded-2xl border bg-gradient-to-br from-card via-card/50 to-background p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-4">XGBoost + Random Forest + SHAP</h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Our models use <strong className="text-fg">gradient boosted trees</strong> (XGBoost) and <strong className="text-fg">random forests</strong>—proven
              workhorses in geoscience ML. But we go further: every prediction is accompanied by{" "}
              <strong className="text-fg">SHAP (SHapley Additive exPlanations)</strong> values.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              SHAP reveals which features pushed a target&apos;s score higher or lower. For executives, this means <strong className="text-fg">confidence</strong>.
              For geoscientists, this means <strong className="text-fg">actionable insight</strong>. For compliance, this means <strong className="text-fg">auditability</strong>.
            </p>
            
            {/* High-impact callout */}
            <div className="rounded-xl border-2 border-success/30 bg-gradient-to-br from-success/10 via-success/5 to-transparent p-5 shadow-inner">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/20">
                  <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-fg mb-2">No black boxes.</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Every high-ranking target comes with a <strong className="text-fg">feature importance breakdown</strong>
                    so you can validate the model&apos;s reasoning against your geological understanding.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Product Views */}
          <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-card/60 via-card/40 to-background p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                👁
              </span>
              Product Views
            </h3>
            <ProductScreensStrip />
          </div>
        </div>
      </section>

      {/* Prospectivity Workflow */}
      <section className="mb-16 lg:mb-24">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-earth/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-earth">
            The Prospectivity Workflow
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            From raw satellite pixels to <span className="bg-gradient-to-r from-earth to-accent bg-clip-text text-transparent">drill-ready targets</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Here&apos;s how the pipeline works under the hood—<strong className="text-fg">transparent, repeatable, auditable</strong>.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <ProspectivityPipeline />
        </div>
      </section>

      {/* What You Actually Get - NEW SECTION */}
      <section className="mb-16 lg:mb-24">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
            Deliverables
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            What <span className="bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">you actually get</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Concrete deliverables from a Scanminers engagement—<strong className="text-fg">not just models, but actionable intelligence</strong>.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Fused Remote Sensing Maps",
              desc: "Multi-sensor composite maps highlighting alteration zones, structural corridors, and geochemical anomalies relevant to your target commodities. Delivered as georeferenced rasters (GeoTIFF) compatible with ArcGIS, QGIS, or your GIS platform."
            },
            {
              title: "Ranked Target Zones",
              desc: "Prospectivity scores for every grid cell in your AOI, ranked by likelihood of mineralization. Each target includes coordinates, confidence bands, and recommended follow-up actions (e.g., ground-truth sampling, geophysical surveys)."
            },
            {
              title: "Explainable Reasoning",
              desc: "Feature importance breakdowns (SHAP values) showing which data inputs drove each target's score—spectral indices, topography, geochemical pathfinders, etc. No black boxes; you see exactly why the model ranks a zone as high-priority."
            },
            {
              title: "Structured Exploration Report",
              desc: "A written report summarizing methodology, data sources, findings, model limitations, and recommended next steps. Includes clear guidance on where additional data (geophysics, geochemistry, field validation) would add the most value."
            }
          ].map((item, idx) => (
            <div key={item.title} className="group relative rounded-2xl border border-border/70 bg-gradient-to-br from-card/60 via-card/40 to-background p-6 transition hover:border-primary/50 hover:shadow-xl">
              <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10 text-sm font-bold text-secondary">
                {idx + 1}
              </div>
              <h3 className="text-lg font-bold mb-3 pr-10">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border-2 border-success/30 bg-gradient-to-br from-success/10 via-success/5 to-transparent p-8 shadow-inner">
          <h3 className="text-sm font-bold uppercase tracking-wider text-success mb-4">
            Regional-Scale Capability
          </h3>
          <p className="text-base text-muted-foreground mb-4 leading-relaxed">
            Our workflows can cover <strong className="text-fg">regional to basin-scale AOIs spanning hundreds of km²</strong>, processing multi-sensor 
            datasets to deliver comprehensive prospectivity intelligence <strong className="text-fg">before any field mobilization</strong>.
          </p>
          <div className="rounded-xl border border-success/30 bg-success/5 p-5">
            <p className="text-sm text-fg leading-relaxed">
              Methods have been <strong className="text-success">validated against known mineral deposits with accuracy rates approaching 90%</strong>, 
              significantly outperforming conventional single-dataset targeting approaches.
            </p>
          </div>
        </div>
      </section>

      {/* Pipeline Visualization */}
      <section className="mb-16 lg:mb-24">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            5-Step Workflow
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            From Data to <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Drill Targets</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our systematic pipeline transforms raw multi-sensor data into actionable exploration decisions.
          </p>
        </div>
        
        <TechnologiesPipelineDiagram />
      </section>

      {/* Sustainability & SDG 13 */}
      <section className="mb-16">
        <div className="rounded-3xl border-2 border-success/30 bg-gradient-to-br from-success/10 via-success/5 to-transparent p-8 lg:p-12 shadow-2xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="rounded-full bg-success p-3 shadow-lg">
              <Leaf className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-success/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-success">
                SDG 13
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                Sustainability & <span className="bg-gradient-to-r from-success to-accent bg-clip-text text-transparent">Climate Action</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Smarter Exploration for a Sustainable Future
              </p>
            </div>
          </div>

          <p className="text-base text-muted-foreground mb-4 leading-relaxed">
            Better targeting means <strong className="text-fg">fewer drill pads</strong>, <strong className="text-fg">less land disturbance</strong>, and{" "}
            <strong className="text-fg">reduced carbon emissions</strong> from exploration logistics. When you drill smarter, not more,
            you advance both <strong className="text-fg">mineral security and climate goals</strong>.
          </p>
          <p className="text-base text-muted-foreground mb-6 leading-relaxed">
            Scanminers&apos; approach aligns with <strong className="text-fg">UN SDG 13 (Climate Action)</strong> by enabling more
            efficient resource discovery—<strong className="text-fg">critical for the energy transition</strong> without sacrificing environmental integrity.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="rounded-xl border-2 border-success/30 bg-success/10 px-5 py-3 shadow-inner">
              <p className="text-sm font-bold text-success">Fewer drill holes</p>
            </div>
            <div className="rounded-xl border-2 border-success/30 bg-success/10 px-5 py-3 shadow-inner">
              <p className="text-sm font-bold text-success">Lower emissions</p>
            </div>
            <div className="rounded-xl border-2 border-success/30 bg-success/10 px-5 py-3 shadow-inner">
              <p className="text-sm font-bold text-success">Responsible discovery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center">
        <div className="mx-auto max-w-2xl rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 shadow-2xl">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Ready to Start?
          </div>
          <h2 className="text-2xl font-bold mb-4">
            See how <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">it works in practice</span>
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Explore our case studies to see real-world applications, or <strong className="text-fg">request a custom prospectivity brief</strong>
            for your area of interest.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="primary" className="shadow-xl hover:shadow-2xl">
              <Link href="/prospectivity-brief" className="inline-flex items-center gap-2">
                Request Prospectivity Brief
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/case-studies">
                View Case Studies
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/insights">
                Read Insights
              </Link>
            </Button>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
