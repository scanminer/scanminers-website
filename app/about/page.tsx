import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Target, Users, Lightbulb, Handshake, ExternalLink } from "lucide-react";
import { absoluteUrl } from "@/lib/url";

export const metadata: Metadata = {
  title: "About | Scanminers",
  description: "Meet the team behind Scanminers' GeoAI platform for critical mineral exploration.",
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: {
    title: "About | Scanminers",
    description: "Meet the team behind Scanminers' GeoAI platform for critical mineral exploration.",
    url: absoluteUrl("/about"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Scanminers",
    description: "Meet the team behind Scanminers' GeoAI platform for critical mineral exploration.",
  },
};

export default function AboutPage() {
  const principles = [
    {
      icon: Target,
      title: "Scientific Rigor",
      description: "Every prospectivity model is grounded in peer-reviewed methodologies and validated against known deposits.",
    },
    {
      icon: Lightbulb,
      title: "Explainability First",
      description: "We believe stakeholders deserve to understand why a target ranks high—no black boxes, ever.",
    },
    {
      icon: Users,
      title: "Collaboration with Experts",
      description: "Our AI augments—not replaces—geologist expertise. Domain knowledge shapes every model.",
    },
    {
      icon: Handshake,
      title: "Climate & Community Respect",
      description: "Smarter targeting means less environmental disturbance and alignment with SDG 13 climate goals.",
    },
  ];

  const workflow = [
    {
      step: "1",
      title: "Initial Prospectivity Brief",
      description: "Submit your area of interest and target commodities. We deliver a preliminary assessment within 10 business days.",
    },
    {
      step: "2",
      title: "Joint Scoping",
      description: "Review findings together. Discuss model assumptions, data sources, and refinement opportunities.",
    },
    {
      step: "3",
      title: "Ongoing Advisory",
      description: "Access regular reporting, model updates, and strategic guidance as your exploration program advances.",
    },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 lg:py-20">
      {/* Mission & Vision */}
      <section className="mb-16 lg:mb-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            About Scanminers
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            We modernize <strong>critical mineral exploration</strong> with remote sensing, GeoAI, and explainable analytics—accelerating
            discovery while supporting more sustainable, climate-aligned exploration practices.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-12">
          <div className="rounded-xl border border-border/70 bg-card/60 p-6">
            <h3 className="text-lg font-semibold mb-2">Mission</h3>
            <p className="text-sm text-muted-foreground">
              Transform mineral exploration through transparent, data-rich prospectivity intelligence that points teams to the most promising 
              hectares first—reducing exploration timelines, field disturbance, and capital risk.
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card/60 p-6">
            <h3 className="text-lg font-semibold mb-2">Impact</h3>
            <p className="text-sm text-muted-foreground">
              Support the energy transition by helping find the lithium, cobalt, nickel, rare earth elements, and copper needed for batteries, 
              EVs, and renewable infrastructure—while aligning with climate goals (SDG 13) and minimizing environmental footprint.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mt-6">
          <div className="rounded-xl border border-border/70 bg-card/60 p-6">
            <h3 className="text-lg font-semibold mb-2">Critical Minerals Security</h3>
            <p className="text-sm text-muted-foreground">
              Lithium, cobalt, nickel, REEs, and copper are bottlenecks for batteries, EVs, and renewable infrastructure.
              We help find them faster.
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card/60 p-6">
            <h3 className="text-lg font-semibold mb-2">Energy Transition</h3>
            <p className="text-sm text-muted-foreground">
              Decarbonization requires massive mineral supply growth. Smarter exploration is the only path to meet 2030+ demand.
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card/60 p-6">
            <h3 className="text-lg font-semibold mb-2">Responsible Exploration</h3>
            <p className="text-sm text-muted-foreground">
              Better targeting = fewer drill pads, less land disturbance, lower emissions. Mineral security and climate action are not opposites.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mb-16 lg:mb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Our Scientific Backbone
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Scanminers is built on deep expertise in remote sensing, geoscience, and AI-driven prospectivity modeling—combining 
            academic rigor with practical exploration experience.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Dr. Amin */}
          <div className="rounded-xl border border-border/70 bg-card p-6 lg:p-8">
            <div className="mb-4">
              <h3 className="text-2xl font-semibold">Dr. Amin Beiranvand Pour</h3>
              <p className="text-sm text-muted-foreground">Co-Founder & Chief Scientist</p>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Dr. Amin Beiranvand Pour is the Co-Founder & Chief Scientist of Scanminers</strong>, recognized
                internationally for his pioneering research in multi-sensor satellite imagery, spectral analysis, and
                critical mineral targeting.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                His work forms the scientific backbone of the Scanminers GeoAI platform, enabling explainable, data-rich
                prospectivity mapping for rare earth elements, lithium, PGEs, and other energy-transition minerals.
              </p>
              <a
                href="https://orcid.org/0000-0002-7606-5619"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                View ORCID Profile
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Mahmood */}
          <div className="rounded-xl border border-border/70 bg-card p-6 lg:p-8">
            <div className="mb-4">
              <h3 className="text-2xl font-semibold">Mahmood Asadi</h3>
              <p className="text-sm text-muted-foreground">Co-Founder & Chief AI & Product Architect</p>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Mahmood Asadi is the Co-Founder & Chief AI & Product Architect at Scanminers</strong>, responsible
                for translating deep geoscientific expertise into scalable, intelligent exploration technology.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                He designs and architects the Scanminers platform end-to-end—integrating AI-assisted prospectivity modeling,
                multi-sensor workflows, automated pipelines, and modern UX frameworks. Mahmood bridges the gap between
                scientific innovation and real-world usability, ensuring the platform delivers explainable, high-confidence
                insights for critical minerals targeting.
              </p>
            </div>
          </div>
        </div>

        {/* Broader team description */}
        <div className="mt-8 rounded-xl border border-border/70 bg-muted/30 p-6">
          <h3 className="text-lg font-semibold mb-3">Our Broader Scientific Team & Network</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Around this core founding team, Scanminers collaborates with a wider scientific network—specialists in economic geology, 
            geophysics, environmental remote sensing, and data science. This multidisciplinary network allows us to bring the right 
            capabilities into each project as needed, maintaining flexibility and depth without over-extending our operational footprint.
          </p>
          <p className="text-sm text-muted-foreground">
            Our methods are grounded in peer-reviewed research and validated against real-world exploration outcomes. Our broader 
            scientific team has collective experience across dozens of mineral exploration and remote sensing projects worldwide, 
            spanning multiple continents and commodity types.
          </p>
        </div>
      </section>

      {/* What We Believe */}
      <section className="mb-16 lg:mb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            What We Believe
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our core principles guide every model, every insight, and every client partnership.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {principles.map((principle) => {
            const Icon = principle.icon;
            return (
              <div
                key={principle.title}
                className="rounded-xl border border-border/70 bg-card/60 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <Icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-lg font-semibold mb-2">{principle.title}</h3>
                <p className="text-sm text-muted-foreground">{principle.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How We Work With You */}
      <section className="mb-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            How We Work With You
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our engagement model is designed for clarity, speed, and actionable results.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {workflow.map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-border/70 bg-card/60 p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border/70 bg-card p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6">
            Request a prospectivity brief for your area of interest, or book a consultation to discuss your exploration goals.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/prospectivity-brief"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Request a Prospectivity Brief
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/consultation"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-6 py-3 text-sm font-semibold shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Book a Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
