import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Satellite, LineChart, Layers, MapPin } from "lucide-react";
import { absoluteUrl } from "@/lib/url";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { FramedImage } from "@/components/marketing/framed-image";

export const metadata: Metadata = {
  title: "Solutions | Scanminers",
  description:
    "Multi-sensor fusion and explainable AI for critical mineral exploration. Better targeting, fewer blind holes.",
  alternates: { canonical: absoluteUrl("/solutions") },
  openGraph: {
    title: "Solutions | Scanminers",
    description:
      "AI-powered mineral prospectivity mapping with multi-sensor fusion.",
    url: absoluteUrl("/solutions"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solutions | Scanminers",
    description:
      "AI-powered mineral prospectivity mapping with multi-sensor fusion.",
  },
};

export default function SolutionsPage() {
  const services = [
    {
      icon: Satellite,
      title: "Multi-sensor data fusion",
      description:
        "We combine optical, radar, DEM and hyperspectral data (where available) to capture structure, alteration, morphology and mining activity in one consistent framework.",
      benefits: [
        "Integrates multispectral, radar and elevation data",
        "Masks clouds, snow and vegetation where possible",
        "Produces clean, exploration-ready base layers",
      ],
    },
    {
      icon: LineChart,
      title: "Explainable AI mineral intelligence",
      description:
        "We use explainable models – not black boxes – to weight geological and remote-sensing evidence against the mineral system you care about.",
      benefits: [
        "AI models tuned to deposit style and commodity",
        "Evidence weighting based on geoscience logic",
        'Clear "why this target?" reasoning for each zone',
      ],
    },
    {
      icon: Layers,
      title: "Prospectivity and risk mapping",
      description:
        "We turn complex geology and remote-sensing signals into intuitive prospectivity and risk maps, so your team can see where to focus – and where not to.",
      benefits: [
        "Regional-scale prospectivity maps (high / medium / low)",
        "Zone- and point-level targets with confidence levels",
        "Highlights both opportunity and risk areas",
      ],
    },
    {
      icon: MapPin,
      title: "Decision-ready exploration reports",
      description:
        "Every study comes with a structured report that your geologists and decision-makers can actually use – methods, results, targets and next steps, all in one place.",
      benefits: [
        "Clear methods and data sources",
        "Maps, tables and target lists you can plug into GIS",
        "Concrete recommendations for fieldwork and drilling",
      ],
    },
  ];

  const deliverables = [
    {
      title: "Fused prospectivity maps",
      items: [
        "Multi-sensor composites highlighting alteration, structure, geochemistry and mining activity",
        "Georeferenced GeoTIFFs compatible with ArcGIS, QGIS, MapInfo",
      ],
    },
    {
      title: "Ranked targets",
      items: [
        "Zone-level or point-level targets, sorted by prospectivity",
        "GPS coordinates, confidence scores and recommended next actions",
      ],
    },
    {
      title: "Transparent reasoning",
      items: [
        "Feature-importance breakdowns showing which inputs drove each score",
        "No black-box mystery – see exactly why the model favours a zone",
      ],
    },
    {
      title: "Actionable reports",
      items: [
        "Written summaries covering methods, data, findings and limitations",
        "Clear recommendations: where to field-check, where to drill, where not to spend",
      ],
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
                "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(34, 211, 238, 0.25), transparent 70%)",
            }}
          />

          <div className="relative z-10 container mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <Badge variant="primary" className="mb-6">
              Solutions
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl mx-auto">
              Remote sensing & AI solutions for{" "}
              <span className="text-[rgb(var(--sm-primary))]">
                critical mineral discovery
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[rgb(var(--sm-text-muted))] mb-10 max-w-3xl mx-auto leading-relaxed">
              Scanminers runs end-to-end remote sensing studies that fuse{" "}
              <strong className="text-[rgb(var(--sm-text))]">
                multi-sensor satellite data, geoscience expertise, and
                explainable AI
              </strong>{" "}
              to surface ranked, drill-ready targets under cover.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
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
                <Link href="/case-studies">View Case Studies</Link>
              </Button>
            </div>

            {/* Key Outcomes Box */}
            <Card
              variant="elevated"
              className="max-w-2xl mx-auto p-8 text-left"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-[rgb(var(--sm-primary))] mb-4">
                When you work with Scanminers, you get:
              </h3>
              <ul className="space-y-3">
                {[
                  "Fused prospectivity maps for your licence or region",
                  "Ranked zones and target points, with full coordinates",
                  "A decision-ready report in weeks – not quarters",
                ].map((outcome) => (
                  <li
                    key={outcome}
                    className="flex items-start gap-3 text-[rgb(var(--sm-text))]"
                  >
                    <ArrowRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-[rgb(var(--sm-primary))]" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>
      </ScrollReveal>

      {/* What We Do Section */}
      <ScrollReveal>
        <section className="py-16 lg:py-24">
          <div className="container mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="accent" className="mb-4">
                What We Do
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Four core capabilities that{" "}
                <span className="text-[rgb(var(--sm-accent))]">
                  de-risk exploration
                </span>
              </h2>
              <p className="text-lg text-[rgb(var(--sm-text-muted))] max-w-3xl mx-auto leading-relaxed">
                Our GeoAI platform integrates diverse geospatial datasets,
                trains explainable models, and delivers drill-ready targets—
                <strong className="text-[rgb(var(--sm-text))]">
                  all before you send a crew to the field
                </strong>
                .
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {services.map((service, idx) => {
                const Icon = service.icon;
                return (
                  <Card
                    key={service.title}
                    variant="default"
                    className="p-6 relative"
                  >
                    {/* Number badge */}
                    <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(var(--sm-primary)/0.15)] text-sm font-bold text-[rgb(var(--sm-primary))]">
                      {idx + 1}
                    </div>

                    <Icon className="h-10 w-10 text-[rgb(var(--sm-primary))] mb-4" />
                    <h3 className="text-xl font-bold mb-3 pr-10">
                      {service.title}
                    </h3>
                    <p className="text-sm text-[rgb(var(--sm-text-muted))] mb-4 leading-relaxed">
                      {service.description}
                    </p>

                    <ul className="space-y-2">
                      {service.benefits.map((benefit) => (
                        <li
                          key={benefit}
                          className="flex items-center gap-2 text-sm text-[rgb(var(--sm-text))]"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--sm-accent))]" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* What You Get Section */}
      <ScrollReveal>
        <section className="py-16 lg:py-24 bg-[rgba(var(--sm-surface)/0.5)]">
          <div className="container mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="default" className="mb-4">
                Deliverables
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                What{" "}
                <span className="text-[rgb(var(--sm-primary))]">
                  you actually get
                </span>
              </h2>
              <p className="text-lg text-[rgb(var(--sm-text-muted))] max-w-3xl mx-auto leading-relaxed">
                Concrete deliverables from a Scanminers engagement—
                <strong className="text-[rgb(var(--sm-text))]">
                  not just models, but actionable intelligence
                </strong>
                .
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {deliverables.map((deliverable, idx) => (
                <Card
                  key={deliverable.title}
                  variant="elevated"
                  className="p-6 relative"
                >
                  {/* Number badge */}
                  <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(var(--sm-accent)/0.15)] text-sm font-bold text-[rgb(var(--sm-accent))]">
                    {idx + 1}
                  </div>

                  <h3 className="text-xl font-bold mb-4 pr-10">
                    {deliverable.title}
                  </h3>
                  <ul className="space-y-3">
                    {deliverable.items.map((item, itemIdx) => (
                      <li
                        key={itemIdx}
                        className="flex items-start gap-3 text-sm text-[rgb(var(--sm-text-muted))] leading-relaxed"
                      >
                        <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[rgb(var(--sm-accent))]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>

            {/* Validation callout */}
            <Card variant="elevated" className="mt-8 p-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[rgb(var(--sm-primary))] mb-4">
                Regional-Scale Capability
              </h3>
              <p className="text-base text-[rgb(var(--sm-text-muted))] mb-4 leading-relaxed">
                Our workflows can cover{" "}
                <strong className="text-[rgb(var(--sm-text))]">
                  regional to basin-scale AOIs spanning hundreds of km²
                </strong>
                , processing multi-sensor datasets to deliver comprehensive
                prospectivity intelligence{" "}
                <strong className="text-[rgb(var(--sm-text))]">
                  before any field mobilization
                </strong>
                .
              </p>
              <div className="rounded-xl border border-[rgba(var(--sm-primary)/0.3)] bg-[rgba(var(--sm-primary)/0.05)] p-5">
                <p className="text-sm text-[rgb(var(--sm-text))] leading-relaxed">
                  Methods have been{" "}
                  <strong className="text-[rgb(var(--sm-primary))]">
                    validated against known mineral deposits with accuracy rates
                    approaching 90%
                  </strong>
                  , significantly outperforming conventional single-dataset
                  targeting approaches.
                </p>
              </div>
            </Card>
          </div>
        </section>
      </ScrollReveal>

      {/* Where This Works Best */}
      <ScrollReveal>
        <section className="py-16 lg:py-24">
          <div className="container mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Where this works best
              </h2>
              <p className="text-lg text-[rgb(var(--sm-text-muted))] leading-relaxed">
                Our approach is most powerful when:
              </p>
            </div>

            <Card variant="elevated" className="p-8 max-w-4xl mx-auto">
              <ul className="space-y-4">
                {[
                  "You're exploring large areas (100+ km²) and need pre-field intelligence",
                  "You have an exploration licence or area of interest – but haven't broken ground yet",
                  "You need to justify a field programme or drilling budget to investors or management",
                  "You're targeting critical minerals – lithium, REE, copper, nickel, bauxite, PGE",
                  "You want independent, science-backed validation before committing capital",
                ].map((point, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-base text-[rgb(var(--sm-text))] leading-relaxed"
                  >
                    <ArrowRight className="mt-1 h-5 w-5 flex-shrink-0 text-[rgb(var(--sm-accent))]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>
      </ScrollReveal>

      {/* Case Study Teaser */}
      <ScrollReveal>
        <section className="py-16 lg:py-24">
          <div className="container mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <Badge variant="mineral" className="mb-4">
                  Real-world example
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Bauxite in Turkey
                </h2>
                <p className="text-lg text-[rgb(var(--sm-text-muted))] mb-6 leading-relaxed">
                  In the Payas–İslahiye region, we fused Sentinel-2, ASTER GDEM
                  and geochemical data to produce a ranked list of 183 bauxite
                  drill points. The model achieved 91% precision when tested
                  against 33 known mines, and recommended four new zones for
                  field validation.
                </p>

                <div className="space-y-3 mb-8">
                  {[
                    "Seven high-priority zones identified",
                    "Alteration indices (kaolinite, gibbsite) emerged as key predictors",
                    "Full coordinates and confidence levels for every point",
                  ].map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <ArrowRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-[rgb(var(--sm-accent))]" />
                      <span className="text-[rgb(var(--sm-text))]">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>

                <Button asChild variant="sm-secondary" size="lg">
                  <Link
                    href="/case-studies/bauxite-payas-islahiye"
                    className="inline-flex items-center gap-2"
                  >
                    View the full case study
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div>
                <FramedImage
                  src="/images/maps/bauxite-zone-5.png"
                  alt="Bauxite Prospectivity Map"
                  width={2336}
                  height={1824}
                  caption="Multi-sensor fusion map showing high-priority zones near validated mines in southern Turkey"
                  variant="elevated"
                />
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Final CTA */}
      <ScrollReveal>
        <section className="py-20 lg:py-32">
          <div className="container mx-auto max-w-4xl px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Have a project in mind?
            </h2>
            <p className="text-lg text-[rgb(var(--sm-text-muted))] mb-10 max-w-2xl mx-auto leading-relaxed">
              Send us your coordinates or licence polygon. We&apos;ll outline
              what a study would deliver, how long it would take, and what it
              would cost—typically within 48 hours.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild variant="sm-primary" size="lg">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2"
                >
                  Get in touch
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="sm-ghost" size="lg">
                <Link href="/how-it-works">See how it works</Link>
              </Button>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
