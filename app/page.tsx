import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  Layers,
  LineChart,
  Scan,
  ShieldCheck,
} from "lucide-react";
import { absoluteUrl } from "@/lib/url";
import type { Insight, CaseStudy } from "contentlayer/generated";
import { allInsights, allCaseStudies } from "contentlayer/generated";
import { formatDate } from "@/lib/date";
import { CriticalCoverageGrid } from "@/components/critical-coverage-grid";
import { HeroCinematic } from "@/components/marketing/hero-cinematic";
import { SatelliteBeforeAfter } from "@/components/marketing/satellite-before-after";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { ProspectivityPipeline } from "@/components/ProspectivityPipeline";
import { ProductScreensStrip } from "@/components/ProductScreensStrip";
import { MultiSensorFusionDiagram } from "@/components/multi-sensor-fusion-diagram";
import { MSection, MDIV, MP } from "@/components/motion-primitives";
import { Button } from "@/components/ui/button";
import {
  CRITICAL_MINERAL_BLUEPRINT,
  aggregateCommoditySummaries,
  buildCriticalCoverageRows,
} from "@/lib/critical-coverage";

export default function Home() {
  const latestInsights: Insight[] = allInsights
    .slice()
    .sort(
      (a: Insight, b: Insight) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, 3);

  const latestCaseStudies: CaseStudy[] = allCaseStudies
    .slice()
    .sort(
      (a: CaseStudy, b: CaseStudy) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, 3);

  const outcomes = [
    {
      title: "Exploration clarity",
      body: "Detect alteration halos, structural corridors, and geochemistry overlaps before mobilizing a single rig.",
      stat: "3×",
      hint: "More confident drill targets",
    },
    {
      title: "Velocity to field",
      body: "Fuse satellite, airborne, and historical assays into a prioritized target deck in weeks, not quarters.",
      stat: "6–8 wks",
      hint: "From ingestion to ranking",
    },
    {
      title: "ESG-grade footprint",
      body: "Point teams to the best hectares first, reducing redundant traverses and sensitive-area impacts.",
      stat: "-40%",
      hint: "Average area surveyed",
    },
  ];

  const operatingStack = [
    {
      title: "Sensing fabric",
      description:
        "Landsat, ASTER, PRISMA, EMIT, PALSAR, Falcon, magnetics, gravity, and public geochem ingested nightly.",
      detail:
        "Radiometric + atmospheric correction, MNF denoise, structural tensors, terrane-normalized indices.",
      icon: Scan,
    },
    {
      title: "Fusion + explainable AI",
      description:
        "DPCA, AIG-DHA, MF/ANN and gradient boosters blended with transparent AHP weighting.",
      detail:
        "Every score ships with SHAP-style feature attributions and uncertainty tiles for QP and ESG review.",
      icon: Layers,
    },
    {
      title: "Prospectivity board",
      description:
        "Tiered target stacks, siting coordinates, confidence bands, and recommended follow-up programs.",
      detail:
        "Delivered inside your GIS, Notion, or Teams workspace with auto-generated field packets.",
      icon: LineChart,
    },
    {
      title: "Governance + safety",
      description:
        "Automated change logs, Sentry-backed monitoring, and role-scoped admin for joint ventures.",
      detail:
        "Integrates with Decap CMS, GitHub, and Turnstile-protected admin flows for rapid approvals.",
      icon: ShieldCheck,
    },
  ];

  const funnelOptions = [
    {
      title: "Prospectivity brief (free)",
      description:
        "Share regions, commodities, and data inventory for a rapid-fit assessment. Useful when you want to validate a thesis before budget cycles close.",
      bullets: [
        "High-level review covering AOI fit, candidate workflows, and recommended next steps.",
        "Turnaround in 2–3 business days with clear yes/no on whether to progress to modelling.",
        "Ideal for heads of exploration, strategy leads, and JV partners comparing belts.",
      ],
      turnaround: "Typical turnaround: 2–3 business days",
      cta: { label: "Request a brief", href: "/prospectivity-brief" },
    },
    {
      title: "Paid consultation (60 minutes)",
      description:
        "A working session with Scanminers' geoscience + AI leads to review your AOI, datasets, and immediate decisions.",
      bullets: [
        "Live walkthrough of maps, datasets, and risk registers with direct access to the core team.",
        "Bank transfer instructions issued instantly; fee is credited if you launch a project within six months.",
        "Best for executives who need concrete guidance, wiring details, and sequencing of deliverables.",
      ],
      turnaround: "Slots available weekly; confirmation after payment receipt.",
      cta: { label: "Book a consultation", href: "/consultation" },
    },
  ];

  const commoditySummaries = aggregateCommoditySummaries([
    { docs: allInsights, type: "Insight" },
    { docs: allCaseStudies, type: "Case Study" },
  ]);

  const criticalMineralGrid = buildCriticalCoverageRows(
    CRITICAL_MINERAL_BLUEPRINT,
    commoditySummaries
  );

  return (
    <main className="min-h-screen">
      {/* Hero Section - Cinematic Dark Mode Experience */}
      <HeroCinematic />

      {/* Signature Interaction: How Scanminers Sees Under Cover */}
      <ScrollReveal>
        <section className="bg-gradient-to-b from-[rgb(var(--sm-bg))] to-background py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 space-y-10">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--sm-surface-elevated))] px-4 py-2 border border-[rgba(var(--sm-border-subtle)/0.35)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--sm-primary))] animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--sm-primary))]">
                  AI Intelligence Layer
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--sm-text))]">
                How Scanminers sees under cover
              </h2>
              <p className="text-lg text-[rgb(var(--sm-text-muted))] max-w-2xl mx-auto">
                Our AI fuses raw satellite and geophysical data into
                prospectivity maps and ranked mineral targets under cover.
              </p>
            </div>
            <div className="mx-auto max-w-4xl space-y-4">
              <SatelliteBeforeAfter />
              <p className="text-sm text-center text-[rgb(var(--sm-text-subtle))] max-w-3xl mx-auto">
                Same ground, two views: raw multi-sensor inputs on the left, and
                a Scanminers fusion prospectivity map on the right.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <div className="mx-auto max-w-7xl space-y-16 px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
        {/* Why Exploration is Hard - Enhanced */}
        <ScrollReveal>
          <section className="rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card/50 to-background px-8 py-12 shadow-lg sm:px-12">
            <div className="mx-auto max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                  The Challenge
                </span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight">
                Why traditional exploration can&apos;t keep pace
              </h2>
              <p className="text-xl leading-relaxed text-muted">
                The energy transition needs{" "}
                <strong className="text-fg">faster discovery cycles</strong>.
                Conventional field methods hit limits at scale.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background p-6 transition-all hover:border-primary/50 hover:shadow-xl dark:bg-background/80">
                <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="mb-3 text-lg font-bold">
                  Limited field coverage
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  Traditional surveys cover narrow transects—often &lt;5% of an
                  AOI. Screening 500+ km² on foot takes years and drains budgets
                  before a single drill hole.
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background p-6 transition-all hover:border-primary/50 hover:shadow-xl dark:bg-background/80">
                <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="mb-3 text-lg font-bold">
                  High-risk capital allocation
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  Boards demand data-driven decisions. Committing $2M+ drill
                  programs with incomplete targeting = lower hit rates and
                  wasted cycles you can&apos;t afford.
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background p-6 transition-all hover:border-primary/50 hover:shadow-xl dark:bg-background/80">
                <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="mb-3 text-lg font-bold">
                  Extended timelines kill momentum
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  Conventional workflows take 6-12 months from reconnaissance to
                  drill-ready targets. Your competition moves faster with remote
                  sensing intelligence.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-inner">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="mb-2 text-sm font-bold text-fg">
                    Remote sensing changes everything
                  </p>
                  <p className="text-sm leading-relaxed text-muted">
                    By fusing satellite, airborne, and geophysical data at
                    scale, you screen entire belts in{" "}
                    <strong className="text-fg">6-8 weeks</strong> and deliver
                    ranked targets with transparent confidence scores (~90%
                    validation rates).{" "}
                    <Button
                      asChild
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-sm"
                    >
                      <Link href="/prospectivity-brief">
                        Start with a free brief →
                      </Link>
                    </Button>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Visual Hero Component + Fusion Diagram */}
        <ScrollReveal delay={100}>
          <section className="space-y-6">
            <MSection className="text-center space-y-3">
              <MP className="text-sm uppercase tracking-[0.3em] text-muted">
                GeoAI Platform
              </MP>
              <MDIV>
                <h2 className="text-3xl font-semibold">
                  Multi-Sensor Fusion Meets Explainable AI
                </h2>
              </MDIV>
              <MP className="text-lg text-muted-foreground max-w-3xl mx-auto">
                From satellite imagery to drill targets, our platform integrates
                diverse data sources with transparent machine learning.
              </MP>
            </MSection>
            {/* Lightweight animated overview of the fusion pipeline (Phase 1). Replaced by Framer Motion in Phase 2. */}
            <div className="mx-auto max-w-5xl">
              <MultiSensorFusionDiagram />
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Button asChild variant="link">
                <Link
                  href="/technologies"
                  className="inline-flex items-center gap-2"
                >
                  Learn how it works
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="link">
                <Link href="/about" className="inline-flex items-center gap-2">
                  Meet the team
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>
        </ScrollReveal>

        {/* What You Get - Enhanced Outcomes */}
        <section className="space-y-10 rounded-3xl border border-border/50 bg-gradient-to-br from-background via-card/30 to-background px-8 py-12 shadow-2xl sm:px-12">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-success">
                Proven Outcomes
              </span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight">
              What you gain with GeoAI prospectivity
            </h2>
            <p className="text-xl leading-relaxed text-muted">
              Built for geology leads, data scientists, and field
              superintendents who need{" "}
              <strong className="text-fg">defensible intelligence</strong>—not
              black-box predictions.
            </p>
          </div>

          <MSection className="grid gap-6 md:grid-cols-3">
            {outcomes.map((card, idx) => (
              <MDIV
                key={card.title}
                className="group relative overflow-hidden rounded-2xl border-2 border-border/50 bg-background p-7 transition-all hover:border-primary hover:shadow-2xl dark:bg-background/80"
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-2xl transition-all group-hover:scale-150" />
                <div className="relative">
                  <div className="mb-4 inline-flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="text-sm font-bold">{idx + 1}</span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted">
                      {card.title}
                    </p>
                  </div>
                  <p className="mb-6 text-sm leading-relaxed text-muted">
                    {card.body}
                  </p>
                  <div className="border-t border-border/50 pt-4">
                    <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {card.stat}
                    </p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-muted">
                      {card.hint}
                    </p>
                  </div>
                </div>
              </MDIV>
            ))}
          </MSection>

          <div className="rounded-2xl border-2 border-success/30 bg-gradient-to-br from-success/10 via-success/5 to-transparent p-8 shadow-inner">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-success/20">
                <svg
                  className="h-7 w-7 text-success"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="mb-3 text-lg font-bold text-fg">
                  Validation speaks louder than promises
                </p>
                <p className="text-base leading-relaxed text-muted">
                  Our multi-sensor fusion workflows have been applied to
                  regional-scale AOIs spanning{" "}
                  <strong className="text-fg">hundreds of km²</strong>,
                  achieving validation rates{" "}
                  <strong className="text-fg">approaching 90%</strong> against
                  known mineral targets (AUC 0.88-0.92). This significantly
                  outperforms conventional single-dataset approaches and
                  translates into{" "}
                  <strong className="text-fg">
                    higher-confidence drill decisions
                  </strong>{" "}
                  your board can defend.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    asChild
                    size="sm"
                    variant="link"
                    className="text-success hover:text-success/90"
                  >
                    <Link href="/case-studies">View case studies →</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="link"
                    className="text-success hover:text-success/90"
                  >
                    <Link href="/technologies">Technical methodology →</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Screens Section */}
        <section className="space-y-8">
          <div className="text-center space-y-3">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Product Views
            </div>
            <h2 className="text-3xl font-bold">
              From{" "}
              <span className="text-[rgb(var(--sm-primary))]">
                prospectivity maps
              </span>{" "}
              to explainable insights
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Three core views power exploration decision-making:{" "}
              <strong className="text-fg">regional heatmaps</strong>,{" "}
              <strong className="text-fg">feature importance charts</strong>,
              and <strong className="text-fg">ranked target lists</strong>.
            </p>
          </div>
          <ProductScreensStrip />
        </section>

        <section className="rounded-3xl border bg-gradient-to-br from-card via-card/50 to-background px-6 py-10 sm:px-10 shadow-lg">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Prospectivity Workflow
              </div>
              <h2 className="text-3xl font-bold">
                From raw data to{" "}
                <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                  drill-ready targets
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Our systematic 5-step pipeline transforms multi-sensor data into
                actionable exploration decisions{" "}
                <strong className="text-fg">in under 48 hours</strong>.
              </p>
            </div>
            <Button asChild variant="link">
              <Link
                href="/technologies"
                className="inline-flex items-center gap-2"
              >
                View full technology stack
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <ProspectivityPipeline />
        </section>

        {/* Keep original operating stack for detail */}
        <section className="rounded-3xl border bg-gradient-to-br from-card via-card/30 to-background px-6 py-10 sm:px-10 shadow-lg">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-earth/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-earth">
                Scanminers Operating Stack
              </div>
              <h2 className="text-3xl font-bold">
                Technical implementation{" "}
                <span className="bg-gradient-to-r from-earth to-primary bg-clip-text text-transparent">
                  by the numbers
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Every layer is explainable by design, with{" "}
                <strong className="text-fg">
                  AI copilots embedded in the CMS
                </strong>{" "}
                so teams can iterate in real time.
              </p>
            </div>
            <Button asChild variant="link">
              <Link href="/insights" className="inline-flex items-center gap-2">
                Read the technical deep dives
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {operatingStack.map((step, idx) => (
              <div
                key={step.title}
                className="group relative rounded-2xl border border-border/70 bg-gradient-to-br from-muted/40 via-muted/20 to-background p-6 transition hover:border-primary/50 hover:shadow-xl"
              >
                <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-earth/10 text-base font-bold text-earth">
                  {idx + 1}
                </div>
                <div className="flex items-center gap-3">
                  <step.icon className="h-11 w-11 rounded-xl border border-border/60 bg-background/60 p-2 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">
                      Step
                    </p>
                    <h3 className="text-lg font-bold">{step.title}</h3>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
                <div className="mt-4 rounded-xl border border-border/40 bg-card/60 p-4">
                  <p className="text-sm text-muted leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border bg-gradient-to-br from-background via-card/30 to-background px-6 py-10 shadow-[0_30px_90px_rgba(15,23,42,0.12)] sm:px-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                Choose Your Next Step
              </div>
              <h2 className="text-3xl font-bold">
                Two fast paths{" "}
                <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                  into the funnel
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Start with a{" "}
                <strong className="text-fg">
                  complimentary prospectivity brief
                </strong>{" "}
                to scope fit, or wire the consultation fee for a deeper working
                session. Both routes use the same Turnstile-protected admin
                stack, so approvals stay governed.
              </p>
            </div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {funnelOptions.map((option, idx) => (
              <article
                key={option.title}
                className="group relative flex h-full flex-col rounded-2xl border border-border/70 bg-gradient-to-br from-card/70 via-card/40 to-background p-6 transition hover:border-primary/50 hover:shadow-xl"
              >
                <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">
                    Engagement
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight">
                    {option.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {option.description}
                  </p>
                </div>
                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                  {option.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-success">
                  {option.turnaround}
                </div>
                <div className="mt-6 flex-1" />
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="shadow-md hover:shadow-lg"
                >
                  <Link href={option.cta.href}>{option.cta.label}</Link>
                </Button>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border bg-gradient-to-br from-card/40 via-card/20 to-background px-6 py-10 shadow-[0_30px_90px_rgba(15,23,42,0.15)] sm:px-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
                Critical Mineral Coverage Grid
              </div>
              <h2 className="text-3xl font-bold">
                Active programs and{" "}
                <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  upcoming slots
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Track which mandates already ship with explainable assets and
                which ones are scoping. Each card links to the{" "}
                <strong className="text-fg">
                  freshest field note or case study
                </strong>
                so your team can dive deeper.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/contact" className="inline-flex items-center gap-2">
                Submit an AOI
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-8">
            <CriticalCoverageGrid rows={criticalMineralGrid} />
          </div>
        </section>

        <section className="rounded-3xl border bg-gradient-to-br from-background via-card/30 to-background px-6 py-10 sm:px-10 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Field Proven
              </div>
              <h2 className="text-3xl font-bold">
                Latest work{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  from the team
                </span>
              </h2>
            </div>
            <Button asChild variant="link">
              <Link
                href="/case-studies"
                className="inline-flex items-center gap-2"
              >
                Browse all case studies
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                Case studies
              </p>
              {latestCaseStudies.length === 0 ? (
                <p className="text-muted-foreground">
                  No case studies published yet.
                </p>
              ) : (
                latestCaseStudies.map((s) => (
                  <article
                    key={s._id}
                    className="group rounded-2xl border border-border/70 bg-gradient-to-br from-card/60 via-card/40 to-background p-5 transition hover:border-primary/50 hover:shadow-xl"
                  >
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted">
                      Critical minerals · {formatDate(s.publishedAt)}
                    </div>
                    <Link href={s.url} className="pressable mt-3 block">
                      <h3 className="text-xl font-bold tracking-tight group-hover:text-primary">
                        {s.title}
                      </h3>
                    </Link>
                    {s.summary && (
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {s.summary}
                      </p>
                    )}
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                      View work
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </article>
                ))
              )}
            </div>
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                Insights
              </p>
              {latestInsights.length === 0 ? (
                <p className="text-muted-foreground">
                  No insights available yet.
                </p>
              ) : (
                latestInsights.map((p: Insight) => (
                  <article
                    key={p._id}
                    className="group rounded-2xl border border-border/70 bg-gradient-to-br from-card/40 via-card/20 to-background p-5 transition hover:border-primary/50 hover:shadow-xl"
                  >
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted">
                      Research note · {formatDate(p.publishedAt)}
                    </div>
                    <Link href={p.url} className="pressable mt-3 block">
                      <h3 className="text-xl font-bold tracking-tight group-hover:text-primary">
                        {p.title}
                      </h3>
                    </Link>
                    {p.summary && (
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {p.summary}
                      </p>
                    )}
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                      Read insight
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-10 sm:px-10 shadow-2xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Next Step
              </div>
              <h2 className="text-3xl font-bold leading-tight">
                Bring prospectivity intelligence{" "}
                <span className="text-[rgb(var(--sm-primary))]">
                  into your exploration stack
                </span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Submit a brief for a quick-fit assessment, wire the consultation
                fee for a working session, or jump straight into a scoped
                project—
                <strong className="text-fg">
                  each option uses the same governed workflows
                </strong>
                .
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  variant="primary"
                  className="shadow-xl hover:shadow-2xl"
                >
                  <Link href="/prospectivity-brief">
                    Request a prospectivity brief
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/consultation">Book a paid consultation</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/contact">Talk to the team</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border-2 border-border/70 bg-background/90 p-6 shadow-lg">
              <p className="font-bold text-foreground">What to expect</p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                  <span>
                    <strong className="text-fg">30-minute scoping call</strong>{" "}
                    with geology + data leads.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                  <span>
                    Secure data drop or{" "}
                    <strong className="text-fg">GitHub sync</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                  <span>
                    Draft prospectivity board + admin-ready content within{" "}
                    <strong className="text-fg">10 business days</strong>.
                  </span>
                </li>
              </ul>
              <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
                  Contact
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  contact@scanminers.com
                </p>
              </div>
            </div>
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
