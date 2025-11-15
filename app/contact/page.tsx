import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/url";
import { ContactForm } from "@/components/contact-form";
import { ArrowUpRight, CheckCircle2, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact | Scanminers",
  description: "Request a demo or talk with our team about your exploration program.",
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: {
    title: "Contact | Scanminers",
    description: "Request a demo or talk with our team about your exploration program.",
    url: absoluteUrl("/contact"),
    type: "website",
    images: [{ url: absoluteUrl("/og-default.svg") }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Scanminers",
    description: "Request a demo or talk with our team about your exploration program.",
    images: [absoluteUrl("/og-default.svg")],
  },
};

const steps = [
  { label: "Scoping call", detail: "30 minutes with geology + data leads to define AOI, commodity mandate, and data custody." },
  { label: "Data sync", detail: "Secure upload, GitHub PAT, or S3 presigned links—your choice. Turnaround starts immediately." },
  { label: "Prospectivity board", detail: "Draft target tiers, rationale layers, and CMS-ready copy in ≤10 business days." },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen px-6 py-12 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl space-y-10">
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-primary/20 to-slate-900/60 px-6 py-10 text-white sm:px-10">
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/70">Start a project</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">Share your area of interest and we’ll build the first board</h1>
          <p className="mt-4 text-base text-white/85 sm:text-lg">
            Send coordinates, existing datasets, or even a Decap brief link. The admin tools spin up a draft, regenerate imagery, and open a PR you can approve inside the CMS.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.label} className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-white/60">{step.label}</p>
                <p className="mt-2 text-sm text-white/85">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6 rounded-3xl border bg-card/70 p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted">What to include</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">Your note gets faster when we receive:</h2>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>AOI boundaries (KML/GeoJSON) or a simple description of the belt and commodity.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Data inventory links—satellite scenes, airborne surveys, drill logs, ESG constraints.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Stakeholders we should invite (JV partners, regulators, marketing) so workflows stay governed.</span>
              </li>
            </ul>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Need an NDA first?</p>
              <p className="mt-1">We’ll countersign within one business day. Attach a link in the form or email <span className="font-semibold">legal@scanminers.com</span>.</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted">
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Responses in <strong>≤24 hours</strong> on business days
              </span>
              <span className="inline-flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Prefer email? contact@scanminers.com
              </span>
            </div>
          </div>
          <div className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
            <h2 className="text-xl font-semibold text-foreground">Secure request form</h2>
            <p className="mt-1 text-sm text-muted-foreground">Protected by Cloudflare Turnstile. We reply via Resend with a scheduling link.</p>
            <div className="mt-4">
              <ContactForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
