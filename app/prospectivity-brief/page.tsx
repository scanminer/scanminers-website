import type { Metadata } from "next";
import Link from "next/link";
import { ProspectivityBriefForm } from "@/components/forms/prospectivity-brief-form";
import { absoluteUrl } from "@/lib/url";

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: "Request a Prospectivity Brief | Scanminers",
  description:
    "Share your region and commodities of interest for a high-level Scanminers prospectivity assessment and next-step guidance.",
  alternates: { canonical: absoluteUrl("/prospectivity-brief") },
};

export default async function ProspectivityBriefPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const defaultCommodity = typeof resolvedParams?.commodity === "string" ? resolvedParams.commodity : undefined;

  return (
    <main className="min-h-screen bg-background px-6 py-12 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-10">
          <section className="space-y-6 rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 shadow-2xl sm:p-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Prospectivity Brief
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground leading-tight">
                Request a <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">critical minerals</span> prospectivity brief
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Share your regions, commodities, and available data. We&apos;ll assess whether a Scanminers workflow is a <strong className="text-fg">strong fit</strong>,
                highlight applicable methodologies, and outline <strong className="text-fg">recommended next steps</strong>.
              </p>
              <a href="#brief-form" className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-bold text-primary-foreground shadow-lg transition hover:-translate-y-0.5 hover:shadow-2xl">
                Request a brief
              </a>
            </div>
          </section>

          <section className="rounded-3xl border bg-gradient-to-br from-card via-card/50 to-background p-6 shadow-lg sm:p-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              What to Expect
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              A high-level assessment—<span className="text-accent">not a full model</span>
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              A prospectivity brief is a <strong className="text-fg">high-level assessment</strong>. For qualified requests we:
            </p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {[
                "Review your region(s), commodity focus, and available datasets.",
                "Indicate which remote sensing, geophysical, and geochemical workflows apply.",
                "Suggest a potential modelling approach and when a paid engagement makes sense."
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed pt-0.5">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm font-semibold text-fg">If we&apos;re not the right fit, we&apos;ll tell you so you don&apos;t waste time.</p>
            
            <div className="mt-8 rounded-2xl border-2 border-success/30 bg-gradient-to-br from-success/10 via-success/5 to-transparent p-6 shadow-inner">
              <h3 className="text-sm font-bold uppercase tracking-wider text-success mb-4">
                What a Full Engagement Delivers
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  { label: "Fused remote sensing maps", desc: "of your AOI highlighting alteration and structural patterns" },
                  { label: "Ranked zones of interest", desc: "with explainable reasoning (SHAP-style feature attributions)" },
                  { label: "Structured written report", desc: "summarizing methods, findings, uncertainties, and suggested next steps" },
                  { label: "Clear guidance", desc: "on where additional data (geophysics, geochem, field validation) adds most value" }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/20">
                      <svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="leading-relaxed">
                      <strong className="text-fg">{item.label}</strong> {item.desc}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-xl border border-success/30 bg-success/5 p-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-success">Typical full engagement</strong> covers regional-scale AOIs (hundreds of km²) with <strong className="text-fg">validation rates approaching 90%</strong> against known targets.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border bg-gradient-to-br from-card via-card/50 to-background p-6 shadow-lg sm:p-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-earth/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-earth">
              Who This Is For
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-6">Find the <span className="text-earth">right fit</span></h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
                <p className="text-base font-bold text-primary mb-4">✓ Perfect fit if you are</p>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {[
                    "Stress-testing a belt before the next budgeting cycle.",
                    "Comparing multiple countries or AOIs for a JV mandate.",
                    "Building an internal memo and need Scanminers language + workflows."
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border-2 border-secondary/30 bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent p-6">
                <p className="text-base font-bold text-secondary mb-4">→ Consider paid consultation when</p>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {[
                    "You already have datasets in hand and want direct guidance.",
                    "You require wiring instructions or purchase paperwork.",
                    "You expect to kick off a programme within the next quarter."
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border bg-gradient-to-br from-card via-card/50 to-background p-6 shadow-lg sm:p-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              Process & Timeline
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-6">Turnaround and <span className="text-accent">follow-up</span></h2>
            <ol className="space-y-4">
              {[
                { num: 1, text: "Submit the form so the team can review your AOI, commodities, and timing." },
                { num: 2, text: "Receive a response in 2–3 business days outlining fit and suggested workflows." },
                { num: 3, text: "Graduate to a paid consultation or scoped engagement when you are ready." }
              ].map((step) => (
                <li key={step.num} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-lg font-bold text-accent">
                    {step.num}
                  </span>
                  <span className="text-sm text-muted-foreground leading-relaxed pt-2">{step.text}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Need a working session instead? <Link href="/consultation" className="font-bold text-primary hover:underline">Book the 60-minute paid consultation</Link> and we&apos;ll send payment instructions immediately.
              </p>
            </div>
          </section>
        </div>
        <div id="brief-form" className="lg:sticky lg:top-8">
          <ProspectivityBriefForm defaultCommodity={defaultCommodity} />
        </div>
      </div>
    </main>
  );
}

