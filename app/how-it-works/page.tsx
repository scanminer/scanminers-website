import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Target,
  Satellite,
  Cpu,
  Layers,
  MapPin,
} from "lucide-react";
import { absoluteUrl } from "@/lib/url";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { FramedImage } from "@/components/marketing/framed-image";
import { brandImages } from "@/lib/brand-images";

export const metadata: Metadata = {
  title: "How It Works | Scanminers",
  description:
    "From raw satellite pixels to drill-ready targets: the 5-step Scanminers prospectivity workflow.",
  alternates: { canonical: absoluteUrl("/how-it-works") },
  openGraph: {
    title: "How It Works | Scanminers",
    description:
      "The 5-step prospectivity workflow: transparent, repeatable, auditable.",
    url: absoluteUrl("/how-it-works"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How It Works | Scanminers",
    description:
      "The 5-step prospectivity workflow: transparent, repeatable, auditable.",
  },
};

export default function HowItWorksPage() {
  const steps = [
    {
      icon: Target,
      number: 1,
      title: "Define the problem and area of interest",
      description:
        "Every study starts with geology and business context, not algorithms. We work with you to define the commodity, deposit style, area of interest and decision you're trying to make.",
      details: [
        "Clarify commodity and deposit model (e.g. bauxite, porphyry copper, lithium brines)",
        "Agree the area of interest and licences to include or exclude",
        "Capture existing knowledge (maps, reports, drill data, field observations) so we don't reinvent what you already know",
      ],
      color: "primary",
    },
    {
      icon: Satellite,
      number: 2,
      title: "Assemble the multi-sensor satellite stack",
      description:
        "We build a tailored data stack for your project, combining optical, radar, DEM and hyperspectral sources (where available). Each sensor sees a different part of the mineral system.",
      details: [
        "Select and acquire appropriate satellite missions (e.g. multispectral, radar, elevation, hyperspectral if justified)",
        "Apply pre-processing and corrections so data from different dates and sensors are comparable",
        "Mask clouds, snow, water and dense vegetation where possible to reduce noise in the final products",
      ],
      color: "accent",
    },
    {
      icon: Cpu,
      number: 3,
      title: "Engineer geoscience features from remote sensing",
      description:
        "We transform imagery into geologically meaningful features that respond to alteration, structure, morphology and mining activity – the building blocks of a mineral system.",
      details: [
        "Derive spectral indices and alteration indicators (e.g. iron oxides, clays, carbonates) from multispectral/hyperspectral data",
        "Extract lineaments and structural trends from radar/DEM to highlight faults, fractures and contacts",
        "Compute morphological and contextual layers (slope, curvature, drainage, distance to existing mines and prospects)",
      ],
      color: "mineral",
    },
    {
      icon: Layers,
      number: 4,
      title: "Fuse evidence with explainable AI",
      description:
        "We combine all evidence layers into prospectivity and risk maps using explainable models – not black-box predictions. The weights are grounded in geoscience logic and transparent to your team.",
      details: [
        "Define evidence layers linked to your mineral system (alteration, structure, mining density, morphology, etc.)",
        "Use explainable AI / weighted decision models to fuse the evidence into continuous prospectivity maps",
        "Quantify which evidence contributes most to each target, so geologists can review and challenge the results",
      ],
      color: "primary",
    },
    {
      icon: MapPin,
      number: 5,
      title: "Generate targets and an exploration plan",
      description:
        "We convert maps into concrete decisions: ranked zones and targets, coordinates, and a recommended exploration path that respects your budget, access and risk constraints.",
      details: [
        "Identify and rank high-, medium- and lower-priority zones and point targets",
        "Deliver coordinates in GIS-ready formats (KMZ and spreadsheets) with confidence levels and key drivers for each target",
        "Provide practical recommendations for fieldwork, geophysics, geochemistry and drilling, aligned with your stage of exploration",
      ],
      color: "accent",
    },
  ];

  const dataSources = [
    {
      icon: Satellite,
      name: "Optical Satellite",
      examples: "Sentinel-2, Landsat 8/9",
      description:
        "Multispectral imaging for mineral mapping and alteration detection",
    },
    {
      icon: Layers,
      name: "Hyperspectral",
      examples: "PRISMA, EnMAP",
      description:
        "High-resolution spectroscopy for precise mineralogical signatures",
    },
    {
      icon: Cpu,
      name: "DEM & Topography",
      examples: "SRTM, ASTER GDEM",
      description: "Elevation, slope, aspect for structural geology analysis",
    },
    {
      icon: MapPin,
      name: "Geochemistry",
      examples: "Stream sediments, soil samples",
      description:
        "Ground-truth elemental concentrations and pathfinder elements",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <ScrollReveal>
        <section className="relative py-20 lg:py-32">
          {/* Subtle gradient glow */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-full h-full opacity-30"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(249, 115, 22, 0.25), transparent 70%)",
            }}
          />

          <div className="relative z-10 container mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <Badge variant="accent" className="mb-6">
              How it works
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl mx-auto">
              From raw satellite pixels to{" "}
              <span className="text-[rgb(var(--sm-accent))]">
                ranked drill targets in five steps
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[rgb(var(--sm-text-muted))] mb-8 max-w-3xl mx-auto leading-relaxed">
              Scanminers runs a structured, explainable workflow: we define the
              problem with you, assemble a multi-sensor satellite stack,
              engineer geoscience features, fuse the evidence with explainable
              AI, and deliver ranked targets and maps your team can act on.
            </p>
            <p className="text-sm text-[rgb(var(--sm-text-subtle))] mb-10 max-w-2xl mx-auto">
              This page is for exploration teams who want to see exactly how a
              Scanminers study runs before they engage.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild variant="sm-primary" size="lg">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2"
                >
                  Request a Scan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="sm-secondary" size="lg">
                <Link href="/solutions">View Solutions</Link>
              </Button>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 5-Step Workflow */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="primary" className="mb-4">
              The five-step workflow
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              A structured process{" "}
              <span className="text-[rgb(var(--sm-primary))]">
                you can walk through on a call
              </span>
            </h2>
            <p className="text-lg text-[rgb(var(--sm-text-muted))] max-w-3xl mx-auto leading-relaxed">
              Each step is documented, geoscience-grounded and repeatable. No
              shortcuts, no mystery.
            </p>
          </div>

          {/* Steps List */}
          <div className="space-y-12 lg:space-y-16">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isEven = idx % 2 === 0;

              return (
                <ScrollReveal key={step.number}>
                  <div
                    className={`grid gap-8 lg:grid-cols-2 lg:gap-12 items-center ${
                      isEven ? "" : "lg:grid-flow-dense"
                    }`}
                  >
                    {/* Content */}
                    <div className={isEven ? "" : "lg:col-start-2"}>
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                            step.color === "primary"
                              ? "bg-[rgba(var(--sm-primary)/0.15)] text-[rgb(var(--sm-primary))]"
                              : step.color === "accent"
                              ? "bg-[rgba(var(--sm-accent)/0.15)] text-[rgb(var(--sm-accent))]"
                              : "bg-[rgba(var(--sm-text)/0.15)] text-[rgb(var(--sm-text))]"
                          }`}
                        >
                          <Icon className="h-7 w-7" />
                        </div>
                        <div
                          className={`text-5xl font-bold ${
                            step.color === "primary"
                              ? "text-[rgb(var(--sm-primary))]"
                              : step.color === "accent"
                              ? "text-[rgb(var(--sm-accent))]"
                              : "text-[rgb(var(--sm-text-subtle))]"
                          }`}
                        >
                          {step.number}
                        </div>
                      </div>

                      <h3 className="text-2xl md:text-3xl font-bold mb-4">
                        {step.title}
                      </h3>
                      <p className="text-base text-[rgb(var(--sm-text-muted))] mb-6 leading-relaxed">
                        {step.description}
                      </p>

                      <ul className="space-y-3">
                        {step.details.map((detail) => (
                          <li key={detail} className="flex items-start gap-3">
                            <ArrowRight
                              className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                                step.color === "primary"
                                  ? "text-[rgb(var(--sm-primary))]"
                                  : step.color === "accent"
                                  ? "text-[rgb(var(--sm-accent))]"
                                  : "text-[rgb(var(--sm-text-subtle))]"
                              }`}
                            />
                            <span className="text-sm text-[rgb(var(--sm-text))]">
                              {detail}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Visual */}
                    <div
                      className={isEven ? "lg:col-start-2" : "lg:col-start-1"}
                    >
                      {step.number === 1 && (
                        <FramedImage
                          src={brandImages.howItWorks.step1AOI}
                          alt="Defined area of interest polygon over rugged terrain with known occurrences highlighted"
                          width={2752}
                          height={1536}
                          caption="Start by defining the area of interest and known occurrences before we model anything."
                          variant="elevated"
                        />
                      )}
                      {step.number === 2 && (
                        <FramedImage
                          src={brandImages.howItWorks.step2MultiSensor}
                          alt="Same terrain seen by different satellite sensors: optical, radar, elevation and spectral bands"
                          width={2752}
                          height={1536}
                          caption="The same ground seen by different sensors: optical, radar, elevation and spectral data."
                          variant="elevated"
                        />
                      )}
                      {step.number === 3 && (
                        <FramedImage
                          src={brandImages.howItWorks.step3Features}
                          alt="Remote-sensing derived geoscience features including lineaments, alteration indices and infrastructure"
                          width={2752}
                          height={1536}
                          caption="We derive geoscience features from remote sensing: structures, alteration indices and access."
                          variant="elevated"
                        />
                      )}
                      {step.number === 4 && (
                        <FramedImage
                          src={brandImages.howItWorks.step4FusionConcept}
                          alt="Multiple map layers converging into a smooth prospectivity map, representing AI fusion of evidence"
                          width={2752}
                          height={1536}
                          caption="Multiple evidence layers are fused into a single prospectivity surface with explainable AI."
                          variant="elevated"
                        />
                      )}
                      {step.number === 5 && (
                        <FramedImage
                          src={brandImages.howItWorks.step5FinalMap}
                          alt="Scanminers fusion prospectivity map with zones, lineaments, mines and ranked targets for bauxite"
                          width={2752}
                          height={1536}
                          caption="The final fusion map and ranked targets are ready to drive field planning and decision-making."
                          variant="elevated"
                        />
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Multi-Sensor Fusion Deep Dive */}
      <ScrollReveal>
        <section className="py-16 lg:py-24 bg-[rgba(var(--sm-surface)/0.5)]">
          <div className="container mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="primary" className="mb-4">
                Multi-sensor fusion & explainable AI
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                How we combine evidence
              </h2>
              <p className="text-lg text-[rgb(var(--sm-text-muted))] max-w-3xl mx-auto leading-relaxed">
                Different sensors see different parts of the earth system. We
                design each study&apos;s data stack and fusion approach around{" "}
                <strong className="text-[rgb(var(--sm-text))]">
                  the mineral system you care about
                </strong>
                , so the results are grounded in geoscience, not a generic
                template.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {dataSources.map((source, idx) => {
                const Icon = source.icon;
                return (
                  <Card
                    key={source.name}
                    variant="default"
                    className="p-6 relative"
                  >
                    <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(var(--sm-text)/0.1)] text-sm font-bold text-[rgb(var(--sm-text-subtle))]">
                      {idx + 1}
                    </div>
                    <Icon className="h-10 w-10 text-[rgb(var(--sm-primary))] mb-3" />
                    <h3 className="font-bold mb-1">{source.name}</h3>
                    <p className="text-xs text-[rgb(var(--sm-text-muted))] mb-2 font-semibold">
                      {source.examples}
                    </p>
                    <p className="text-sm text-[rgb(var(--sm-text-muted))] leading-relaxed">
                      {source.description}
                    </p>
                  </Card>
                );
              })}
            </div>

            <div className="grid gap-8 lg:grid-cols-2 mt-8">
              <Card variant="elevated" className="p-8">
                <h3 className="text-xl font-bold mb-4">
                  Multi-sensor fusion, tuned to your mineral system
                </h3>
                <p className="text-[rgb(var(--sm-text-muted))] mb-6 leading-relaxed">
                  Different sensors see different parts of the earth system. We
                  design each study&apos;s data stack around the mineral system
                  you care about, so the fusion is driven by geoscience, not a
                  generic template.
                </p>
                <ul className="space-y-3">
                  {[
                    "Combine optical, radar, DEM and hyperspectral where it adds value",
                    "Emphasise layers that matter for your deposit style (e.g. karst morphology for bauxite, structures for porphyry copper, salars for lithium brines)",
                    "Keep a traceable data lineage from raw imagery to final prospectivity maps",
                  ].map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm text-[rgb(var(--sm-text))] leading-relaxed"
                    >
                      <div className="h-1.5 w-1.5 mt-1.5 rounded-full bg-[rgb(var(--sm-accent))] flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card variant="elevated" className="p-8">
                <h3 className="text-xl font-bold mb-4">
                  Explainable AI, so geologists stay in control
                </h3>
                <p className="text-[rgb(var(--sm-text-muted))] mb-6 leading-relaxed">
                  Our models are built to be inspected. For high-priority
                  targets, we can show which evidence layers matter most and how
                  they interact, so your technical team can review, challenge
                  and refine the results.
                </p>
                <ul className="space-y-3">
                  {[
                    "Use transparent weighting schemes and explainable models",
                    'Provide per-target reasoning ("why this target") alongside the score',
                    "Update and refine models as new field and drilling data becomes available",
                  ].map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm text-[rgb(var(--sm-text))] leading-relaxed"
                    >
                      <div className="h-1.5 w-1.5 mt-1.5 rounded-full bg-[rgb(var(--sm-accent))] flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Final CTA */}
      <ScrollReveal>
        <section className="py-20 lg:py-32">
          <div className="container mx-auto max-w-4xl px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Want to see this workflow on your ground?
            </h2>
            <p className="text-lg text-[rgb(var(--sm-text-muted))] mb-10 max-w-2xl mx-auto leading-relaxed">
              Share your area of interest, commodity and stage of exploration,
              and we&apos;ll outline what a Scanminers remote sensing and AI
              study would look like for your project – including scope,
              timelines and example deliverables.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild variant="sm-primary" size="lg">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2"
                >
                  Request a Scan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="sm-ghost" size="lg">
                <Link href="/case-studies">View Case Studies</Link>
              </Button>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
