import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Target,
  Users,
  Lightbulb,
  Handshake,
  ExternalLink,
} from "lucide-react";
import { absoluteUrl } from "@/lib/url";
import { Button } from "@/components/ui/button";
import { getRandomMineralImage } from "@/lib/mineral-images";

export const metadata: Metadata = {
  title: "About | Scanminers",
  description:
    "Meet the team behind Scanminers' GeoAI platform for critical mineral exploration.",
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: {
    title: "About | Scanminers",
    description:
      "Meet the team behind Scanminers' GeoAI platform for critical mineral exploration.",
    url: absoluteUrl("/about"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Scanminers",
    description:
      "Meet the team behind Scanminers' GeoAI platform for critical mineral exploration.",
  },
};

export default function AboutPage() {
  const mineralBg = getRandomMineralImage();

  const principles = [
    {
      icon: Target,
      title: "Scientific Rigor",
      description:
        "Every prospectivity model is grounded in peer-reviewed methodologies and validated against known deposits.",
    },
    {
      icon: Lightbulb,
      title: "Explainability First",
      description:
        "We believe stakeholders deserve to understand why a target ranks high—no black boxes, ever.",
    },
    {
      icon: Users,
      title: "Collaboration with Experts",
      description:
        "Our AI augments—not replaces—geologist expertise. Domain knowledge shapes every model.",
    },
    {
      icon: Handshake,
      title: "Climate & Community Respect",
      description:
        "Smarter targeting means less environmental disturbance and alignment with SDG 13 climate goals.",
    },
  ];

  const workflow = [
    {
      step: "1",
      title: "Initial Prospectivity Brief",
      description:
        "Submit your area of interest and target commodities. We deliver a preliminary assessment within 10 business days.",
    },
    {
      step: "2",
      title: "Joint Scoping",
      description:
        "Review findings together. Discuss model assumptions, data sources, and refinement opportunities.",
    },
    {
      step: "3",
      title: "Ongoing Advisory",
      description:
        "Access regular reporting, model updates, and strategic guidance as your exploration program advances.",
    },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 lg:py-20">
      {/* Mission & Vision */}
      <section className="mb-16 lg:mb-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            About Scanminers
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            Modernizing{" "}
            <span className="text-[rgb(var(--sm-primary))]">
              critical mineral exploration
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            We combine{" "}
            <strong className="text-fg">
              remote sensing, GeoAI, and explainable analytics
            </strong>{" "}
            to accelerate discovery while supporting more{" "}
            <strong className="text-fg">
              sustainable, climate-aligned exploration practices
            </strong>
            .
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-12">
          <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 shadow-lg">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Mission
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">
              Transform mineral exploration through{" "}
              <strong className="text-fg">
                transparent, data-rich prospectivity intelligence
              </strong>{" "}
              that points teams to the most promising hectares first—
              <strong className="text-fg">
                reducing exploration timelines, field disturbance, and capital
                risk
              </strong>
              .
            </p>
          </div>
          <div className="rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent p-8 shadow-lg">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              Impact
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">
              Support the <strong className="text-fg">energy transition</strong>{" "}
              by helping find the lithium, cobalt, nickel, rare earth elements,
              and copper needed for batteries, EVs, and renewable
              infrastructure—while aligning with{" "}
              <strong className="text-fg">climate goals (SDG 13)</strong> and
              minimizing environmental footprint.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mt-6">
          {[
            {
              title: "Critical Minerals Security",
              desc: "Lithium, cobalt, nickel, REEs, and copper are bottlenecks for batteries, EVs, and renewable infrastructure. We help find them faster.",
              color: "secondary",
            },
            {
              title: "Energy Transition",
              desc: "Decarbonization requires massive mineral supply growth. Smarter exploration is the only path to meet 2030+ demand.",
              color: "accent",
            },
            {
              title: "Responsible Exploration",
              desc: "Better targeting = fewer drill pads, less land disturbance, lower emissions. Mineral security and climate action are not opposites.",
              color: "success",
            },
          ].map((item, idx) => (
            <div
              key={item.title}
              className="group relative rounded-2xl border border-border/70 bg-gradient-to-br from-card/60 via-card/40 to-background p-6 transition hover:border-primary/50 hover:shadow-xl"
            >
              <div
                className={`absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-${item.color}/10 text-sm font-bold text-${item.color}`}
              >
                {idx + 1}
              </div>
              <h3 className="text-lg font-bold mb-3 pr-10">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mb-16 lg:mb-24 relative overflow-hidden">
        {/* Mineral texture overlay - very subtle */}
        <div
          className="absolute inset-0 bg-mineral opacity-[0.08] mix-blend-screen pointer-events-none"
          style={{ backgroundImage: `url(${mineralBg})` }}
        />
        <div className="absolute inset-0 bg-mineral-overlay pointer-events-none" />

        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />

        <div className="mb-12 text-center relative z-10">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-earth/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-earth">
            Leadership Team
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Our{" "}
            <span className="bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent font-extrabold">
              scientific backbone
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Scanminers is built on{" "}
            <strong className="text-fg">
              deep expertise in remote sensing, geoscience, and AI-driven
              prospectivity modeling
            </strong>
            —combining academic rigor with practical exploration experience.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 relative z-10">
          {/* Dr. Amin */}
          <div className="group relative rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-card via-card/70 to-background p-8 lg:p-10 shadow-xl transition hover:border-primary/50 hover:shadow-2xl">
            <div className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              1
            </div>
            <div className="mb-6">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Co-Founder
              </div>
              <h3 className="text-2xl font-bold mb-1">
                Dr. Amin Beiranvand Pour
              </h3>
              <p className="text-sm font-semibold text-primary">
                Chief Scientist
              </p>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-fg">
                  Dr. Amin Beiranvand Pour is the Co-Founder & Chief Scientist
                  of Scanminers
                </strong>
                , recognized internationally for his pioneering research in{" "}
                <strong className="text-fg">
                  multi-sensor satellite imagery, spectral analysis, and
                  critical mineral targeting
                </strong>
                .
              </p>
              <p>
                His work forms the{" "}
                <strong className="text-fg">
                  scientific backbone of the Scanminers GeoAI platform
                </strong>
                , enabling explainable, data-rich prospectivity mapping for rare
                earth elements, lithium, PGEs, and other energy-transition
                minerals.
              </p>
              <div className="pt-4 border-t border-border/50">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  Expertise
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Remote Sensing",
                    "Spectral Analysis",
                    "Critical Minerals",
                    "Geoscience ML",
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <a
                href="https://orcid.org/0000-0001-8783-5120"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline mt-4"
              >
                View ORCID Profile
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Mahmood */}
          <div className="group relative rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-card via-card/70 to-background p-8 lg:p-10 shadow-xl transition hover:border-accent/50 hover:shadow-2xl">
            <div className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-lg font-bold text-accent">
              2
            </div>
            <div className="mb-6">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Co-Founder
              </div>
              <h3 className="text-2xl font-bold mb-1">Mahmood Asadi</h3>
              <p className="text-sm font-semibold text-accent">
                Chief AI & Product Architect
              </p>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-fg">
                  Mahmood Asadi is the Co-Founder & Chief AI & Product Architect
                  at Scanminers
                </strong>
                , responsible for translating{" "}
                <strong className="text-fg">
                  deep geoscientific expertise into scalable, intelligent
                  exploration technology
                </strong>
                .
              </p>
              <p>
                He designs and architects the{" "}
                <strong className="text-fg">
                  Scanminers platform end-to-end
                </strong>
                —integrating AI-assisted prospectivity modeling, multi-sensor
                workflows, automated pipelines, and modern UX frameworks.
                Mahmood bridges the gap between scientific innovation and
                real-world usability, ensuring the platform delivers{" "}
                <strong className="text-fg">
                  explainable, high-confidence insights
                </strong>{" "}
                for critical minerals targeting.
              </p>
              <div className="pt-4 border-t border-border/50">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  Expertise
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "AI Architecture",
                    "Product Design",
                    "MLOps",
                    "Platform Engineering",
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs font-semibold text-accent"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Broader team description */}
        <div className="mt-8 rounded-2xl border-2 border-success/30 bg-gradient-to-br from-success/10 via-success/5 to-transparent p-8 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success/20">
              <Users className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">
                Our Broader Scientific Team & Network
              </h3>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                Around this core founding team, Scanminers collaborates with a{" "}
                <strong className="text-fg">wider scientific network</strong>
                —specialists in economic geology, geophysics, environmental
                remote sensing, and data science. This multidisciplinary network
                allows us to bring the right capabilities into each project as
                needed, maintaining{" "}
                <strong className="text-fg">flexibility and depth</strong>{" "}
                without over-extending our operational footprint.
              </p>
              <div className="rounded-xl border border-success/30 bg-success/5 p-5">
                <p className="text-sm text-fg leading-relaxed">
                  Our methods are grounded in{" "}
                  <strong className="text-success">
                    peer-reviewed research
                  </strong>{" "}
                  and validated against real-world exploration outcomes. Our
                  broader scientific team has collective experience across{" "}
                  <strong className="text-success">
                    dozens of mineral exploration and remote sensing projects
                    worldwide
                  </strong>
                  , spanning multiple continents and commodity types.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Believe */}
      <section className="mb-16 lg:mb-24">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
            Core Principles
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            What{" "}
            <span className="bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent font-extrabold">
              we believe
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our core principles guide{" "}
            <strong className="text-fg">
              every model, every insight, and every client partnership
            </strong>
            .
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {principles.map((principle, idx) => {
            const Icon = principle.icon;
            return (
              <div
                key={principle.title}
                className="group relative rounded-2xl border border-border/70 bg-gradient-to-br from-card/60 via-card/40 to-background p-6 shadow-sm transition hover:border-primary/50 hover:shadow-xl"
              >
                <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {idx + 1}
                </div>
                <Icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-bold mb-3 pr-10">
                  {principle.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {principle.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How We Work With You */}
      <section className="mb-16">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Engagement Model
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            How we{" "}
            <span className="bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent font-extrabold">
              work with you
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our engagement model is designed for{" "}
            <strong className="text-fg">
              clarity, speed, and actionable results
            </strong>
            .
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {workflow.map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-card/60 via-card/40 to-background p-6 shadow-lg transition hover:border-primary/50 hover:shadow-xl"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xl font-bold text-white shadow-lg">
                {item.step}
              </div>
              <h3 className="text-lg font-bold mb-3">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <div className="mx-auto max-w-2xl rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 shadow-2xl">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Ready to Start?
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Let&apos;s{" "}
            <span className="text-[rgb(var(--sm-primary))]">
              unlock your AOI&apos;s potential
            </span>
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Request a <strong className="text-fg">prospectivity brief</strong>{" "}
            for your area of interest, or{" "}
            <strong className="text-fg">book a consultation</strong> to discuss
            your exploration goals.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              variant="primary"
              className="shadow-xl hover:shadow-2xl"
            >
              <Link
                href="/prospectivity-brief"
                className="inline-flex items-center gap-2"
              >
                Request a Prospectivity Brief
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/consultation">Book a Consultation</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
