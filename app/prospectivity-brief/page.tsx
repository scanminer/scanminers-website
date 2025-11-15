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
    <main className="min-h-screen px-6 py-12 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-10">
          <section className="space-y-6 rounded-3xl border border-border/70 bg-card/50 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.18)] sm:p-10">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-muted">Prospectivity brief</p>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">Request a critical minerals prospectivity brief</h1>
              <p className="text-lg text-muted-foreground">
                Share your regions, commodities, and available data. We’ll assess whether a Scanminers workflow is a strong fit,
                highlight applicable methodologies, and outline recommended next steps.
              </p>
              <a href="#brief-form" className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-base font-semibold text-primary-foreground">
                Request a brief
              </a>
            </div>
          </section>

          <section className="rounded-3xl border border-border/60 bg-background/80 p-6 sm:p-10">
            <h2 className="text-2xl font-semibold tracking-tight">What you can expect</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              A prospectivity brief is a high-level assessment—not a full prospectivity model. For qualified requests we:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Review your region(s), commodity focus, and available datasets.</li>
              <li>• Indicate which remote sensing, geophysical, and geochemical workflows apply.</li>
              <li>• Suggest a potential modelling approach and when a paid engagement makes sense.</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">If we&apos;re not the right fit, we&apos;ll tell you so you don&apos;t waste time.</p>
            
            <div className="mt-6 rounded-lg border border-sky-200/50 bg-sky-50/50 dark:border-sky-800/50 dark:bg-sky-950/30 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-sky-900 dark:text-sky-200 mb-3">
                What a Full Engagement Delivers
              </h3>
              <ul className="space-y-2 text-sm text-foreground/70 dark:text-foreground/60">
                <li>• <strong>Fused remote sensing maps</strong> of your AOI highlighting alteration and structural patterns</li>
                <li>• <strong>Ranked zones of interest</strong> with explainable reasoning (SHAP-style feature attributions)</li>
                <li>• <strong>Structured written report</strong> summarizing methods, findings, uncertainties, and suggested next steps</li>
                <li>• <strong>Clear guidance</strong> on where additional data (geophysics, geochem, field validation) adds most value</li>
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Typical full engagement covers regional-scale AOIs (hundreds of km²) with validation rates approaching 90% against known targets.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-border/60 bg-background/80 p-6 sm:p-10">
            <h2 className="text-2xl font-semibold tracking-tight">Who this is for</h2>
            <div className="mt-4 grid gap-6 lg:grid-cols-2">
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="text-base font-medium text-foreground">A perfect fit if you are</p>
                <ul className="space-y-2">
                  <li>• Stress-testing a belt before the next budgeting cycle.</li>
                  <li>• Comparing multiple countries or AOIs for a JV mandate.</li>
                  <li>• Building an internal memo and need Scanminers language + workflows.</li>
                </ul>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="text-base font-medium text-foreground">Consider the paid consultation when</p>
                <ul className="space-y-2">
                  <li>• You already have datasets in hand and want direct guidance.</li>
                  <li>• You require wiring instructions or purchase paperwork.</li>
                  <li>• You expect to kick off a programme within the next quarter.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border/60 bg-background/80 p-6 sm:p-10">
            <h2 className="text-2xl font-semibold tracking-tight">Turnaround and follow-up</h2>
            <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>1. Submit the form so the team can review your AOI, commodities, and timing.</li>
              <li>2. Receive a response in 2–3 business days outlining fit and suggested workflows.</li>
              <li>3. Graduate to a paid consultation or scoped engagement when you are ready.</li>
            </ol>
            <p className="mt-4 text-sm text-muted-foreground">
              Need a working session instead? <Link href="/consultation" className="font-semibold text-primary">Book the 60-minute paid consultation</Link> and we’ll send payment instructions immediately.
            </p>
          </section>
        </div>
        <div id="brief-form" className="lg:sticky lg:top-8">
          <ProspectivityBriefForm defaultCommodity={defaultCommodity} />
        </div>
      </div>
    </main>
  );
}
