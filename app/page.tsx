import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, Globe, Layers, LineChart, Scan, ShieldCheck } from "lucide-react";
import { absoluteUrl } from "@/lib/url";
import type { Insight, CaseStudy } from "contentlayer/generated";
import { allInsights, allCaseStudies } from "contentlayer/generated";
import { formatDate } from "@/lib/date";
import { CriticalCoverageGrid } from "@/components/critical-coverage-grid";
import { HeroVisual } from "@/components/HeroVisual";
import { ProspectivityPipeline } from "@/components/ProspectivityPipeline";
import { ProductScreensStrip } from "@/components/ProductScreensStrip";
import {
  CRITICAL_MINERAL_BLUEPRINT,
  aggregateCommoditySummaries,
  buildCriticalCoverageRows,
} from "@/lib/critical-coverage";

export default function Home() {
  const latestInsights: Insight[] = allInsights
    .slice()
    .sort((a: Insight, b: Insight) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);

  const latestCaseStudies: CaseStudy[] = allCaseStudies
    .slice()
    .sort((a: CaseStudy, b: CaseStudy) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
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
      description: "Landsat, ASTER, PRISMA, EMIT, PALSAR, Falcon, magnetics, gravity, and public geochem ingested nightly.",
      detail: "Radiometric + atmospheric correction, MNF denoise, structural tensors, terrane-normalized indices.",
      icon: Scan,
    },
    {
      title: "Fusion + explainable AI",
      description: "DPCA, AIG-DHA, MF/ANN and gradient boosters blended with transparent AHP weighting.",
      detail: "Every score ships with SHAP-style feature attributions and uncertainty tiles for QP and ESG review.",
      icon: Layers,
    },
    {
      title: "Prospectivity board",
      description: "Tiered target stacks, siting coordinates, confidence bands, and recommended follow-up programs.",
      detail: "Delivered inside your GIS, Notion, or Teams workspace with auto-generated field packets.",
      icon: LineChart,
    },
    {
      title: "Governance + safety",
      description: "Automated change logs, Sentry-backed monitoring, and role-scoped admin for joint ventures.",
      detail: "Integrates with Decap CMS, GitHub, and Turnstile-protected admin flows for rapid approvals.",
      icon: ShieldCheck,
    },
  ];

  const proofPoints = [
    { label: "Countries mapped", value: "12", detail: "Lithium brines, nickel laterites, rare earth belts" },
    { label: "Remote scenes processed", value: "4.7k", detail: "Across optical, radar, radiometrics" },
    { label: "Average uplift", value: "+22%", detail: "Drill hit-rate compared to legacy targeting" },
    { label: "Turnaround", value: "< 48h", detail: "For incremental AOIs once baseline is live" },
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

  const criticalMineralGrid = buildCriticalCoverageRows(CRITICAL_MINERAL_BLUEPRINT, commoditySummaries);

  return (
    <main className="min-h-screen">
      {/* Hero Section - Redesigned */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-primary/20 to-neutral-900 dark:from-neutral-950 dark:via-primary/30 dark:to-black">
        {/* Background Effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-200px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/30 blur-[200px]" />
          <div className="absolute bottom-[-150px] right-[-60px] h-[400px] w-[400px] rounded-full bg-accent/20 blur-[160px]" />
          <div className="absolute left-[10%] top-[30%] h-[300px] w-[300px] rounded-full bg-secondary/15 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_380px] lg:items-start">
            {/* Left Column: Main Message */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
                  Trusted by 12 countries
                </span>
              </div>

              {/* Headline - You-Oriented */}
              <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Find critical minerals{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  before your competition
                </span>
              </h1>

              {/* Subheadline with Urgency (SDG/IEA framing) */}
              <p className="text-xl leading-relaxed text-white/85 sm:text-2xl">
                The energy transition demands <strong className="font-semibold text-white">3× more lithium, 7× more REE</strong> by 2040 (IEA).
                Your next discovery starts with intelligence—not luck.
              </p>

              {/* Value Props */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/20">
                    <LineChart className="h-3.5 w-3.5 text-success" />
                  </div>
                  <p className="text-base text-white/80 sm:text-lg">
                    <strong className="font-semibold text-white">Screen 500+ km²</strong> in weeks with fused satellite, geophysics, and geochemistry
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/20">
                    <ShieldCheck className="h-3.5 w-3.5 text-success" />
                  </div>
                  <p className="text-base text-white/80 sm:text-lg">
                    <strong className="font-semibold text-white">~90% validation rates</strong> against known deposits—drill with confidence
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/20">
                    <Globe className="h-3.5 w-3.5 text-success" />
                  </div>
                  <p className="text-base text-white/80 sm:text-lg">
                    <strong className="font-semibold text-white">Transparent AI</strong> you can defend to boards, JVs, and regulators
                  </p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/prospectivity-brief"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-neutral-900 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20"
                >
                  Get free prospectivity brief
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link
                  href="/consultation"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:border-white/50 hover:bg-white/20"
                >
                  Book paid consultation
                </Link>
                <Link
                  href="/case-studies"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white"
                >
                  View proof in the field
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>

              {/* Trust Signal */}
              <p className="text-sm text-white/60">
                Used by exploration teams at mining majors, junior explorers, and national geological surveys across Africa, Middle East, Asia-Pacific
              </p>
            </div>

            {/* Right Column: Proof Points Card */}
            <div className="rounded-2xl border border-white/15 bg-white/10 p-8 backdrop-blur-xl lg:sticky lg:top-24">
              <p className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Proven at scale</p>
              <div className="space-y-6">
                {proofPoints.map((item) => (
                  <div key={item.label} className="border-b border-white/10 pb-5 last:border-0 last:pb-0">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">{item.label}</p>
                    <p className="mt-2 text-4xl font-bold text-white">{item.value}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/75">{item.detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-lg bg-accent/10 p-4">
                <p className="text-xs font-semibold text-accent">⚡ Fast-track available</p>
                <p className="mt-1 text-sm text-white/80">Incremental AOIs delivered in &lt; 48 hours once baseline model is live</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
        {/* Why Exploration is Hard */}
        <section className="rounded-3xl border bg-card px-6 py-10 sm:px-10 dark:bg-card/50">
          <div className="max-w-4xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">The exploration challenge</p>
            <h2 className="text-3xl font-semibold">Why traditional methods struggle to scale</h2>
            <p className="text-lg text-muted">
              Critical mineral discovery faces compounding obstacles that remote sensing and GeoAI can systematically address.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border bg-background p-5 dark:bg-background/50">
              <h3 className="text-base font-semibold mb-2">Limited field coverage</h3>
              <p className="text-sm text-muted">
                Traditional field surveys cover narrow transects. Screening hundreds of km² on the ground is cost-prohibitive and time-intensive.
              </p>
            </div>
            <div className="rounded-xl border bg-background p-5 dark:bg-background/50">
              <h3 className="text-base font-semibold mb-2">High-risk capital allocation</h3>
              <p className="text-sm text-muted">
                Decision-makers must commit drill budgets with incomplete data, leading to lower hit rates and wasted cycles.
              </p>
            </div>
            <div className="rounded-xl border bg-background p-5 dark:bg-background/50">
              <h3 className="text-base font-semibold mb-2">Extended project timelines</h3>
              <p className="text-sm text-muted">
                Conventional exploration workflows can take quarters to deliver initial target rankings, delaying strategic decisions.
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Remote sensing changes the equation:</strong> by fusing satellite, airborne, and geophysical data at scale, 
              we screen vast regions in weeks and deliver ranked targets with transparent confidence scores—
              <Link href="/prospectivity-brief" className="font-semibold text-primary hover:underline"> start with a Prospectivity Brief</Link> or{" "}
              <Link href="/consultation" className="font-semibold text-primary hover:underline">book a Consultation</Link> to see how it applies to your AOI.
            </p>
          </div>
        </section>

        {/* Visual Hero Component */}
        <section className="space-y-6">
          <div className="text-center space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-muted">GeoAI Platform</p>
            <h2 className="text-3xl font-semibold">Multi-Sensor Fusion Meets Explainable AI</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              From satellite imagery to drill targets, our platform integrates diverse data sources with transparent machine learning.
            </p>
          </div>
          <HeroVisual variant="full" />
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Link href="/technologies" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              Learn how it works
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/about" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              Meet the team
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="space-y-8 rounded-3xl border bg-card/40 px-6 py-10 shadow-[0_40px_120px_rgba(15,23,42,0.18)] sm:px-10">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-muted">What partners get</p>
            <h2 className="text-3xl font-semibold tracking-tight">Built for geology leads, data scientists, and field superintendents</h2>
            <p className="text-lg text-muted-foreground">
              A WordPress-smooth authoring experience with Notion-grade AI assistants powers every deliverable: edit narratives, regenerate cover art,
              launch PRs, or approve releases without leaving the browser.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {outcomes.map((card) => (
              <div key={card.title} className="flex flex-col rounded-2xl border border-border bg-background/80 p-5">
                <div className="text-sm uppercase tracking-[0.4em] text-muted">{card.title}</div>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{card.body}</p>
                <div className="mt-6">
                  <p className="text-3xl font-semibold">{card.stat}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">{card.hint}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <p className="text-sm font-medium text-foreground mb-2">Proven validation rates</p>
            <p className="text-sm text-muted-foreground">
              Our multi-sensor fusion workflows have been applied to regional-scale AOIs spanning hundreds of km², achieving validation rates <strong className="text-foreground">approaching 90%</strong> against known mineral targets.
              This level of accuracy significantly outperforms conventional single-dataset approaches and translates directly into higher-confidence drill decisions.
            </p>
          </div>
        </section>

        {/* Product Screens Section */}
        <section className="space-y-8">
          <div className="text-center space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-muted">Product Views</p>
            <h2 className="text-3xl font-semibold">From Prospectivity Maps to Explainable Insights</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Three core views power exploration decision-making: regional heatmaps, feature importance charts, and ranked target lists.
            </p>
          </div>
          <ProductScreensStrip />
        </section>

        <section className="rounded-3xl border px-6 py-10 sm:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-muted">Prospectivity Workflow</p>
              <h2 className="text-3xl font-semibold">From Raw Data to Drill-Ready Targets</h2>
              <p className="text-lg text-muted-foreground">
                Our systematic 5-step pipeline transforms multi-sensor data into actionable exploration decisions.
              </p>
            </div>
            <Link href="/technologies" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              View full technology stack
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <ProspectivityPipeline />
        </section>

        {/* Keep original operating stack for detail */}
        <section className="rounded-3xl border px-6 py-10 sm:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-muted">Scanminers operating stack</p>
              <h2 className="text-3xl font-semibold">Technical Implementation Details</h2>
              <p className="text-lg text-muted-foreground">
                Every layer is explainable by design, with AI copilots embedded in the CMS so teams can iterate in real time.
              </p>
            </div>
            <Link href="/insights" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              Read the technical deep dives
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {operatingStack.map((step) => (
              <div key={step.title} className="rounded-2xl border border-border/70 bg-muted/20 p-5">
                <div className="flex items-center gap-3">
                  <step.icon className="h-10 w-10 rounded-xl border border-border/60 p-2" />
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-muted">Step</p>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{step.description}</p>
                <p className="mt-3 rounded-xl bg-background/60 p-4 text-sm text-muted">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border bg-background/70 px-6 py-10 shadow-[0_30px_90px_rgba(15,23,42,0.12)] sm:px-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-muted">Choose your next step</p>
              <h2 className="text-3xl font-semibold">Two fast paths into the funnel</h2>
              <p className="text-lg text-muted-foreground">
                Start with a complimentary prospectivity brief to scope fit, or wire the consultation fee for a deeper working session.
                Both routes use the same Turnstile-protected admin stack, so approvals stay governed.
              </p>
            </div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {funnelOptions.map((option) => (
              <article key={option.title} className="flex h-full flex-col rounded-2xl border border-border/70 bg-card/70 p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">Engagement</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">{option.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{option.description}</p>
                </div>
                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                  {option.bullets.map((bullet) => (
                    <li key={bullet}>• {bullet}</li>
                  ))}
                </ul>
                <div className="mt-5 text-xs uppercase tracking-[0.3em] text-muted">{option.turnaround}</div>
                <div className="mt-6 flex-1" />
                <Link
                  href={option.cta.href}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5"
                >
                  {option.cta.label}
                </Link>
              </article>
            ))}
          </div>
        </section>

  <section className="rounded-3xl border bg-card/40 px-6 py-10 shadow-[0_30px_90px_rgba(15,23,42,0.15)] sm:px-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-muted">Critical mineral coverage grid</p>
              <h2 className="text-3xl font-semibold">Active programs and upcoming slots</h2>
              <p className="text-lg text-muted-foreground">
                Track which mandates already ship with explainable assets and which ones are scoping. Each card links to the freshest field note or case study
                so your team can dive deeper.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold"
            >
              Submit an AOI
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8">
            <CriticalCoverageGrid rows={criticalMineralGrid} />
          </div>
        </section>

        <section className="rounded-3xl border bg-background/60 px-6 py-10 sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted">Field proven</p>
              <h2 className="text-3xl font-semibold">Latest work from the team</h2>
            </div>
            <Link href="/case-studies" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              Browse all case studies
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Case studies</p>
              {latestCaseStudies.length === 0 ? (
                <p className="text-muted-foreground">No case studies published yet.</p>
              ) : (
                latestCaseStudies.map((s) => (
                  <article key={s._id} className="group rounded-2xl border border-border/70 bg-card/60 p-5 hover:border-primary/40">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted">
                      Critical minerals · {formatDate(s.publishedAt)}
                    </div>
                    <Link href={s.url} className="mt-3 block">
                      <h3 className="text-xl font-semibold tracking-tight group-hover:text-primary">{s.title}</h3>
                    </Link>
                    {s.summary && <p className="mt-2 text-sm text-muted-foreground">{s.summary}</p>}
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                      View work
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </article>
                ))
              )}
            </div>
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Insights</p>
              {latestInsights.length === 0 ? (
                <p className="text-muted-foreground">No insights available yet.</p>
              ) : (
                latestInsights.map((p: Insight) => (
                  <article key={p._id} className="group rounded-2xl border border-border/70 bg-card/40 p-5 hover:border-primary/40">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted">
                      Research note · {formatDate(p.publishedAt)}
                    </div>
                    <Link href={p.url} className="mt-3 block">
                      <h3 className="text-xl font-semibold tracking-tight group-hover:text-primary">{p.title}</h3>
                    </Link>
                    {p.summary && <p className="mt-2 text-sm text-muted-foreground">{p.summary}</p>}
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                      Read insight
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-10 sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
            <div className="space-y-5">
              <p className="text-sm uppercase tracking-[0.3em] text-primary">Next step</p>
              <h2 className="text-3xl font-semibold">Bring prospectivity intelligence into your exploration stack</h2>
              <p className="text-lg text-muted-foreground">
                Submit a brief for a quick-fit assessment, wire the consultation fee for a working session, or jump straight into a scoped project—each option uses the same governed workflows.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/prospectivity-brief" className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-base font-medium text-primary-foreground">
                  Request a prospectivity brief
                </Link>
                <Link href="/consultation" className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-base font-medium">
                  Book a paid consultation
                </Link>
                <Link href="/contact" className="inline-flex items-center justify-center rounded-xl border border-border/60 px-5 py-3 text-base font-medium">
                  Talk to the team
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-5 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">What to expect</p>
              <ul className="mt-3 space-y-2">
                <li>• 30-minute scoping call with geology + data leads.</li>
                <li>• Secure data drop or GitHub sync.</li>
                <li>• Draft prospectivity board + admin-ready content within 10 business days.</li>
              </ul>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-muted">contact@scanminers.com</p>
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
