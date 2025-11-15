import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/url";
import { ArrowUpRight, Layers, Satellite, Shield } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Technologies | Scanminers",
  description:
    "How Scanminers fuses remote sensing, geophysics, geochemistry, and geology with AI to prioritize high-probability mineral targets.",
  alternates: { canonical: absoluteUrl("/technologies") },
  openGraph: {
    title: "Technologies | Scanminers",
    description:
      "How Scanminers fuses remote sensing, geophysics, geochemistry, and geology with AI to prioritize high-probability mineral targets.",
    url: absoluteUrl("/technologies"),
    type: "website",
    images: [{ url: absoluteUrl("/og-default.svg") }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Technologies | Scanminers",
    description:
      "How Scanminers fuses remote sensing, geophysics, geochemistry, and geology with AI to prioritize high-probability mineral targets.",
    images: [absoluteUrl("/og-default.svg")],
  },
};

const stack = [
  {
    title: "Data fabric",
    icon: Satellite,
    summary: "Nightly ingest + harmonization",
    body:
      "Landsat, ASTER, PRISMA, EMIT, Sentinel-1/2, Falcon, airborne EM, public geochem, and historical assays flow through QUAC/log-residual correction, BRDF normalization, vegetation masking, and MNF denoise.",
    bullets: [
      "Automated QA/QC detects striping, sensor gaps, and datum drift before fusion",
      "Region-aware mosaicking keeps AOIs consistent when your grid shifts",
      "Versioned in Git-backed object storage so analysts can diff layers like code",
    ],
  },
  {
    title: "Fusion + explainable AI",
    icon: Layers,
    summary: "Transparent model stack",
    body:
      "DPCA, AIG-DHA, MF/ANN, gradient boosters, and graph neural nets run in parallel with SHAP-style attribution, ALE structural parsing, and Bayesian uncertainty calibration.",
    bullets: [
      "AHP weighting + role-based overrides keep JV partners in the loop",
      "Confidence tiles + rationale layers export with the same JSON schema",
      "Governed prompts let non-technical editors regenerate imagery safely",
    ],
  },
  {
    title: "Delivery + governance",
    icon: Shield,
    summary: "Prospectivity board + admin UX",
    body:
      "Target tiers, coordinate packets, ESG callouts, and Decap CMS automations publish in under 10 business days—with Sentry, Turnstile, and rate limiting wired in by default.",
    bullets: [
      "One-click publication to Insights, Case Studies, and RSS feeds",
      "Role-scoped admin login plus optional email OTP for sensitive actions",
      "Resend-backed comms + Cloudflare security rules keep spam out",
    ],
  },
];

export default function TechnologiesPage() {
  return (
    <main className="min-h-screen px-6 py-12 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl space-y-12">
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900/40 px-6 py-10 text-white sm:px-10">
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/70">Technology stack</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">From raw pixels to confident drill collars</h1>
          <p className="mt-4 text-base text-white/80 sm:text-lg">
            Scanminers OS is opinionated: transparent ingestion, explainable models, and governance tooling that lets geology leads, data scientists, and executives sign off
            without round-tripping through ten systems.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-slate-900">
              See the stack in action
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/insights" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-medium text-white/90">
              Browse the technical notes
            </Link>
          </div>
        </section>

        <section className="space-y-6">
          {stack.map((layer) => (
            <article key={layer.title} className="rounded-3xl border border-border/70 bg-card/60 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
              <div className="flex items-center gap-4">
                <layer.icon className="h-12 w-12 rounded-2xl border border-border/60 p-3" />
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-muted">{layer.summary}</p>
                  <h2 className="text-2xl font-semibold leading-tight">{layer.title}</h2>
                </div>
              </div>
              <p className="mt-4 text-base text-muted-foreground">{layer.body}</p>
              <ul className="mt-5 space-y-2 text-sm text-muted">
                {layer.bullets.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
