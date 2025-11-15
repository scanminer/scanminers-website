import type { Metadata } from "next";
import Link from "next/link";
import { ConsultationForm } from "@/components/forms/consultation-form";
import { absoluteUrl } from "@/lib/url";

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: "Paid Critical Minerals Consultation | Scanminers",
  description:
    "Book a 60-minute consultation with Scanminers' geoscience and AI team to review your AOI, data landscape, and next steps.",
  alternates: { canonical: absoluteUrl("/consultation") },
};

export default async function ConsultationPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const defaultCommodity = typeof resolvedParams?.commodity === "string" ? resolvedParams.commodity : undefined;

  return (
    <main className="min-h-screen px-6 py-12 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-10">
          <section className="space-y-6 rounded-3xl border border-border/70 bg-card/50 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.18)] sm:p-10">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-muted">Paid consultation</p>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                60-Minute Critical Minerals Prospectivity Consultation
              </h1>
              <p className="text-lg text-muted-foreground">
                A focused, one-hour session with Scanminers’ geoscience and AI team to review your area of interest, data landscape,
                and exploration objectives. Built for leaders who want concrete guidance—not a generic sales pitch.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Review your regions, commodities, and available data (remote sensing, geophysics, geochemistry, drilling).</li>
                <li>• Identify where Scanminers’ prospectivity and geohazard workflows add the most value.</li>
                <li>• Receive a concise follow-up note summarising next steps and potential engagement paths.</li>
              </ul>
              <div className="flex flex-wrap gap-3">
                <a href="#consultation-form" className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-base font-semibold text-primary-foreground">
                  Request a paid consultation
                </a>
                <Link href="/prospectivity-brief" className="text-sm font-semibold text-primary">
                  Just exploring? Start with a free prospectivity brief →
                </Link>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border/60 bg-background/80 p-6 sm:p-10">
            <h2 className="text-2xl font-semibold tracking-tight">Who this consultation is for</h2>
            <div className="mt-4 grid gap-6 lg:grid-cols-2">
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="text-base font-medium text-foreground">Designed for</p>
                <ul className="space-y-2">
                  <li>• VPs / Heads of Exploration planning critical mineral programmes</li>
                  <li>• Technical leads and chief geologists evaluating AI-assisted prospectivity workflows</li>
                  <li>• Government agencies and surveys designing regional screening or tender areas</li>
                </ul>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="text-base font-medium text-foreground">Not a fit for</p>
                <ul className="space-y-2">
                  <li>• Students or general-interest calls (use the Insights library instead)</li>
                  <li>• Organisations without defined AOIs, commodities, or timelines</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border/60 bg-background/80 p-6 sm:p-10">
            <h2 className="text-2xl font-semibold tracking-tight">Format and investment</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>• <strong>Duration:</strong> 60 minutes (online)</li>
              <li>• <strong>Format:</strong> Zoom/Teams with live review of maps, datasets, and workflows</li>
              <li>• <strong>Deliverables:</strong> Discussion + concise written follow-up with recommended actions</li>
              <li>• <strong>Investment:</strong> €X00 (excl. VAT)</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Kick off a project within six months of your consultation and the full fee is credited against your project invoice.
            </p>
          </section>

          <section className="rounded-3xl border border-border/60 bg-background/80 p-6 sm:p-10">
            <h2 className="text-2xl font-semibold tracking-tight">How payment and booking works</h2>
            <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>1. Submit the request form so we can confirm fit.</li>
              <li>2. We send a payment reference and bank transfer details (IBAN, SWIFT/BIC, account name).</li>
              <li>3. Share proof of payment or remittance advice.</li>
              <li>4. We propose times and send a calendar invite with call details.</li>
            </ol>
            <p className="mt-4 text-sm text-muted-foreground">
              Approved corporate clients can request an invoice with agreed payment terms.
            </p>
          </section>
        </div>
        <div id="consultation-form" className="lg:sticky lg:top-8">
          <ConsultationForm defaultCommodity={defaultCommodity} />
        </div>
      </div>
    </main>
  );
}
