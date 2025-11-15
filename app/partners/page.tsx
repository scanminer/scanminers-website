import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, GraduationCap, Satellite, Users } from "lucide-react";
import { absoluteUrl } from "@/lib/url";

export const metadata: Metadata = {
  title: "Partners | Scanminers",
  description: "How Scanminers collaborates with exploration companies, institutions, and data providers to advance critical mineral discovery.",
  alternates: { canonical: absoluteUrl("/partners") },
  openGraph: {
    title: "Partners | Scanminers",
    description: "Working with exploration companies, institutions, and data providers to accelerate critical mineral discovery.",
    url: absoluteUrl("/partners"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Partners | Scanminers",
    description: "Working with exploration companies, institutions, and data providers.",
  },
};

export default function PartnersPage() {
  const partnershipCategories = [
    {
      icon: Building2,
      title: "Exploration & Mining Companies",
      description: "We work with exploration teams and mining companies to accelerate target generation and portfolio prioritization.",
      capabilities: [
        "Regional-scale prospectivity screening across hundreds of km²",
        "Portfolio comparison: rank multiple AOIs or belts before committing budgets",
        "Target validation and drill planning with explainable AI",
        "ESG-aligned exploration: minimize footprint while maximizing discovery confidence",
      ],
      examples: "Ideal for VPs of Exploration, Chief Geologists, and JV partners evaluating new regions.",
    },
    {
      icon: GraduationCap,
      title: "Institutions & Surveys",
      description: "Collaborate with geological surveys, research institutions, and government agencies on methodologies, joint studies, and regional models.",
      capabilities: [
        "Joint research on multi-sensor fusion and GeoAI for mineral exploration",
        "Regional mineral potential assessments for policy and planning",
        "Methodology development and peer-reviewed publications",
        "Training and knowledge transfer on remote sensing workflows",
      ],
      examples: "Partnerships with geological surveys, universities, and national resource agencies.",
    },
    {
      icon: Satellite,
      title: "Technology & Data Providers",
      description: "Integrate with imagery providers, geophysical data vendors, and technology platforms to enhance exploration intelligence.",
      capabilities: [
        "Integration with commercial satellite imagery (hyperspectral, SAR, high-resolution optical)",
        "Geophysical data partnerships (magnetics, gravity, radiometrics)",
        "API and data pipeline integrations for automated workflows",
        "Joint product development with GIS and exploration software vendors",
      ],
      examples: "Partnerships with satellite operators, geophysical survey companies, and exploration tech platforms.",
    },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 lg:py-20">
      {/* Hero Section */}
      <section className="mb-16 lg:mb-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            Partners
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Working with exploration companies, institutions, and data providers to accelerate critical mineral discovery 
            through transparent GeoAI and multi-sensor fusion.
          </p>
        </div>
      </section>

      {/* Partnership Categories */}
      <section className="mb-16 lg:mb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Partnership Models
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Three primary ways organizations collaborate with Scanminers to leverage our prospectivity intelligence platform.
          </p>
        </div>

        <div className="space-y-8">
          {partnershipCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.title}
                className="rounded-xl border border-border/70 bg-card p-6 lg:p-8"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-2">{category.title}</h3>
                    <p className="text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                
                <div className="mt-4 mb-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
                    Capabilities
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {category.capabilities.map((capability) => (
                      <li key={capability} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{capability}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Who this is for:</strong> {category.examples}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Scientific Team & Network */}
      <section className="mb-16 lg:mb-24">
        <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-sky-50/50 to-indigo-50/50 dark:from-sky-950/20 dark:to-indigo-950/20 p-8 lg:p-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="rounded-full bg-primary p-3">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                Our Scientific Team & Network
              </h2>
              <p className="text-lg text-muted-foreground">
                Combining deep expertise with flexible collaboration
              </p>
            </div>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-muted-foreground">
              At Scanminers&apos; core are <strong>Dr. Amin Beiranvand Pour (Co-Founder & Chief Scientist)</strong> and{" "}
              <strong>Mahmood Asadi (Co-Founder & Chief AI & Product Architect)</strong>—bringing world-class expertise 
              in remote sensing, geoscience, and AI-driven prospectivity modeling.
            </p>
            <p className="text-muted-foreground">
              Around this founding team, we collaborate with a wider scientific network—specialists in economic geology, 
              geophysics, environmental remote sensing, and data science. This multidisciplinary network allows us to 
              assemble the right capabilities for each project without exposing individual names publicly until partnerships 
              are formalized.
            </p>
            <p className="text-muted-foreground">
              Our broader scientific team has collective experience across dozens of mineral exploration and remote sensing 
              projects worldwide, spanning multiple continents and commodity types. Methods are grounded in peer-reviewed 
              research and validated against real-world exploration outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border/70 bg-card p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Interested in Partnering?</h2>
          <p className="text-muted-foreground mb-6">
            Whether you&apos;re an exploration company, institution, or technology provider, we&apos;d love to discuss 
            how Scanminers&apos; GeoAI platform can support your goals.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/contact?intent=partnership"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Get in Touch
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/prospectivity-brief"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-6 py-3 text-sm font-semibold shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Request a Prospectivity Brief
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-6 py-3 text-sm font-semibold shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Learn About the Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
