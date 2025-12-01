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
  const defaultCommodity =
    typeof resolvedParams?.commodity === "string"
      ? resolvedParams.commodity
      : undefined;

  return (
    <main className="min-h-screen px-6 py-12 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-10">
          {/* Hero Section */}
          <section className="space-y-6 rounded-3xl border border-secondary/20 bg-gradient-to-br from-secondary/5 via-background to-background p-6 shadow-xl sm:p-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-secondary to-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                Paid Consultation
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-fg">
                60-Minute{" "}
                <span className="bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent font-extrabold">
                  Critical Minerals
                </span>{" "}
                Prospectivity Consultation
              </h1>
              <p className="text-lg leading-relaxed text-fg/80">
                A focused, one-hour session with Scanminers&apos; geoscience and
                AI team to review your area of interest, data landscape, and
                exploration objectives. Built for leaders who want{" "}
                <strong className="text-fg">concrete guidance</strong>—not a
                generic sales pitch.
              </p>
              <ul className="space-y-2.5 text-base text-fg/70">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-secondary"></span>
                  <span>
                    Review your regions, commodities, and available data (remote
                    sensing, geophysics, geochemistry, drilling).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-secondary"></span>
                  <span>
                    Identify where Scanminers&apos; prospectivity and geohazard
                    workflows add the most value.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-secondary"></span>
                  <span>
                    Receive a concise follow-up note summarising next steps and
                    potential engagement paths.
                  </span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="#consultation-form"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-secondary to-accent px-6 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
                >
                  Request a paid consultation
                </a>
                <Link
                  href="/prospectivity-brief"
                  className="inline-flex items-center text-sm font-bold text-primary hover:underline"
                >
                  Just exploring? Start with a free prospectivity brief →
                </Link>
              </div>
            </div>
          </section>

          {/* Who This Is For */}
          <section className="rounded-3xl border border-earth/20 bg-gradient-to-br from-earth/5 via-background to-background p-6 shadow-lg sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-earth to-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
              Who This Is For
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background p-5">
                <p className="text-base font-bold text-fg">✓ Perfect fit</p>
                <ul className="space-y-2.5 text-sm text-fg/70">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                    <span>
                      VPs / Heads of Exploration planning critical mineral
                      programmes
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                    <span>
                      Technical leads and chief geologists evaluating
                      AI-assisted prospectivity workflows
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                    <span>
                      Government agencies and surveys designing regional
                      screening or tender areas
                    </span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4 rounded-2xl border border-secondary/20 bg-gradient-to-br from-secondary/5 to-background p-5">
                <p className="text-base font-bold text-fg">× Not a fit for</p>
                <ul className="space-y-2.5 text-sm text-fg/70">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-secondary"></span>
                    <span>
                      Students or general-interest calls (use the Insights
                      library instead)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-secondary"></span>
                    <span>
                      Organisations without defined AOIs, commodities, or
                      timelines
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/5 via-background to-background p-6 shadow-lg sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
              How It Works
            </div>
            <div className="mt-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/70 text-base font-bold text-white shadow-md">
                  1
                </div>
                <div>
                  <h3 className="mb-2 text-base font-bold text-fg">
                    Scoping & Discovery
                  </h3>
                  <p className="text-sm leading-relaxed text-fg/70">
                    We start by understanding your goals, AOI, target
                    commodities, and existing data inventory (remote sensing,
                    geophysics, geochemistry, drilling logs).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/70 text-base font-bold text-white shadow-md">
                  2
                </div>
                <div>
                  <h3 className="mb-2 text-base font-bold text-fg">
                    Prototype Exploration View (if appropriate)
                  </h3>
                  <p className="text-sm leading-relaxed text-fg/70">
                    Where feasible, we may prepare a small prototype view of
                    your region using public datasets—a rapid illustration of
                    what our multi-sensor workflows can reveal before a full
                    engagement.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/70 text-base font-bold text-white shadow-md">
                  3
                </div>
                <div>
                  <h3 className="mb-2 text-base font-bold text-fg">
                    Scoped Engagement Definition
                  </h3>
                  <p className="text-sm leading-relaxed text-fg/70">
                    We then work with you to define a scoped engagement: which
                    minerals, what scale (regional? basin-wide?), what
                    deliverables (maps, target lists, reports), and what
                    timelines fit your decision cycles.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-success/30 bg-gradient-to-br from-success/10 to-success/5 p-5 shadow-sm">
              <p className="text-sm leading-relaxed text-fg/80">
                <strong className="font-bold text-fg">Outcome:</strong> You
                leave with concrete next steps—not a generic sales pitch. If a
                full project makes sense, we&apos;ll outline deliverables,
                timelines, and pricing. If not, we&apos;ll tell you honestly.
              </p>
            </div>
          </section>

          {/* Format & Investment */}
          <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background p-6 shadow-lg sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
              Format & Investment
            </div>
            <ul className="mt-6 space-y-3 text-sm text-fg/70">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                <span>
                  <strong className="font-bold text-fg">Duration:</strong> 60
                  minutes (online)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                <span>
                  <strong className="font-bold text-fg">Format:</strong>{" "}
                  Zoom/Teams with live review of maps, datasets, and workflows
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                <span>
                  <strong className="font-bold text-fg">Deliverables:</strong>{" "}
                  Discussion + concise written follow-up with recommended
                  actions
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                <span>
                  <strong className="font-bold text-fg">Investment:</strong>{" "}
                  €X00 (excl. VAT)
                </span>
              </li>
            </ul>
            <div className="mt-6 rounded-xl border border-success/30 bg-gradient-to-br from-success/10 to-success/5 p-4 shadow-sm">
              <p className="text-sm leading-relaxed text-fg/80">
                Kick off a project within six months of your consultation and
                the full fee is credited against your project invoice.
              </p>
            </div>
          </section>

          {/* Payment & Booking */}
          <section className="rounded-3xl border border-secondary/20 bg-gradient-to-br from-secondary/5 via-background to-background p-6 shadow-lg sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-secondary to-earth px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
              Payment & Booking
            </div>
            <ol className="mt-6 space-y-4">
              <li className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-secondary/70 text-sm font-bold text-white shadow-md">
                  1
                </div>
                <p className="pt-1 text-sm leading-relaxed text-fg/70">
                  Submit the request form so we can confirm fit.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-secondary/70 text-sm font-bold text-white shadow-md">
                  2
                </div>
                <p className="pt-1 text-sm leading-relaxed text-fg/70">
                  We send a payment reference and bank transfer details (IBAN,
                  SWIFT/BIC, account name).
                </p>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-secondary/70 text-sm font-bold text-white shadow-md">
                  3
                </div>
                <p className="pt-1 text-sm leading-relaxed text-fg/70">
                  Share proof of payment or remittance advice.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-secondary/70 text-sm font-bold text-white shadow-md">
                  4
                </div>
                <p className="pt-1 text-sm leading-relaxed text-fg/70">
                  We propose times and send a calendar invite with call details.
                </p>
              </li>
            </ol>
            <div className="mt-6 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4 shadow-sm">
              <p className="text-sm leading-relaxed text-fg/80">
                Approved corporate clients can request an invoice with agreed
                payment terms.
              </p>
            </div>
          </section>
        </div>
        <div id="consultation-form" className="lg:sticky lg:top-8">
          <ConsultationForm defaultCommodity={defaultCommodity} />
        </div>
      </div>
    </main>
  );
}
