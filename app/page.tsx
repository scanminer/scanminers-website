import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, Globe, Layers, LineChart, Scan, ShieldCheck } from "lucide-react";
import { absoluteUrl } from "@/lib/url";
import type { Insight, CaseStudy } from "contentlayer/generated";
import { allInsights, allCaseStudies } from "contentlayer/generated";
import { formatDate } from "@/lib/date";
import { CriticalCoverageGrid } from "@/components/critical-coverage-grid";
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
    <main className="min-h-screen px-6 py-12 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl space-y-12 lg:space-y-16">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-primary/25 to-slate-900 px-6 py-10 text-white sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-[-200px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/40 blur-[180px]" />
            <div className="absolute bottom-[-120px] right-[-40px] h-[360px] w-[360px] rounded-full bg-emerald-500/20 blur-[140px]" />
          </div>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-white/80">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Scanminers OS
              </div>
              <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                Prospectivity intelligence for the critical minerals transition
              </h1>
              <p className="mt-6 text-lg text-white/80 sm:text-xl">
                We blend remote sensing, geophysics, geochemistry, and structural geology into a living model that highlights
                the most valuable hectares—before field crews start their first traverse.
              </p>
              <ul className="mt-6 space-y-2 text-white/80">
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <Globe className="h-4 w-4" /> Regional to basin-scale coverage with AOI refresh in under 48h.
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <LineChart className="h-4 w-4" /> Explainable scoring, confidence bands, and uncertainty tiles.
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <ShieldCheck className="h-4 w-4" /> Governance-ready workflows for JV partners and regulators.
                </li>
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/prospectivity-brief" className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-base font-medium text-slate-900 shadow-lg shadow-black/20 transition hover:-translate-y-0.5">
                  Request a prospectivity brief
                </Link>
                <Link href="/consultation" className="inline-flex items-center justify-center rounded-xl border border-white/40 px-5 py-3 text-base font-medium text-white/90 transition hover:bg-white/10">
                  Book a paid consultation
                </Link>
                <Link href="/case-studies" className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white">
                  See proof in the field
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur">
              <div className="space-y-5">
                {proofPoints.map((item) => (
                  <div key={item.label} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                    <p className="text-xs uppercase tracking-[0.25em] text-white/60">{item.label}</p>
                    <p className="mt-1 text-3xl font-semibold">{item.value}</p>
                    <p className="text-sm text-white/70">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
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
        </section>

        <section className="rounded-3xl border px-6 py-10 sm:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-muted">Scanminers operating stack</p>
              <h2 className="text-3xl font-semibold">How we go from raw pixels to drill-ready coordinates</h2>
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
