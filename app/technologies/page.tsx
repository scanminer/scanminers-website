import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Satellite, Layers } from "lucide-react";
import { absoluteUrl } from "@/lib/url";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

export const metadata: Metadata = {
  title: "Technologies | Scanminers",
  description:
    "Our technology stack is now described in Solutions and How It Works.",
  alternates: { canonical: absoluteUrl("/technologies") },
  openGraph: {
    title: "Technologies | Scanminers",
    description:
      "Multi-sensor fusion and explainable AI for critical mineral exploration.",
    url: absoluteUrl("/technologies"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Technologies | Scanminers",
    description:
      "Multi-sensor fusion and explainable AI for critical mineral exploration.",
  },
};

export default function TechnologiesPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <ScrollReveal>
        <section className="py-20">
          <div className="container mx-auto max-w-4xl px-6 lg:px-8">
            <Card variant="elevated" className="p-12 text-center">
              <Badge variant="primary" className="mb-6">
                Page Moved
              </Badge>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Our technology stack is now in{" "}
                <span className="text-[rgb(var(--sm-primary))]">Solutions</span>{" "}
                and{" "}
                <span className="text-[rgb(var(--sm-accent))]">
                  How It Works
                </span>
              </h1>

              <p className="text-lg text-[rgb(var(--sm-text-muted))] mb-12 max-w-2xl mx-auto leading-relaxed">
                We&apos;ve reorganized our site to make it easier to understand
                what Scanminers does and how we do it.
              </p>

              {/* Tech Highlights */}
              <div className="grid gap-6 md:grid-cols-2 mb-12 text-left">
                <Card variant="default" className="p-6">
                  <Satellite className="h-10 w-10 text-[rgb(var(--sm-primary))] mb-4" />
                  <h3 className="text-xl font-bold mb-3">
                    Multi-Sensor Fusion
                  </h3>
                  <p className="text-sm text-[rgb(var(--sm-text-muted))] mb-4 leading-relaxed">
                    We integrate optical, hyperspectral, radar, topography, and
                    geochemistry into a unified feature space—revealing
                    cross-sensor patterns no single dataset shows alone.
                  </p>
                  <Link
                    href="/solutions"
                    className="inline-flex items-center gap-2 text-sm font-bold text-[rgb(var(--sm-primary))] hover:underline"
                  >
                    Learn more in Solutions
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Card>

                <Card variant="default" className="p-6">
                  <Layers className="h-10 w-10 text-[rgb(var(--sm-accent))] mb-4" />
                  <h3 className="text-xl font-bold mb-3">
                    Explainable AI Models
                  </h3>
                  <p className="text-sm text-[rgb(var(--sm-text-muted))] mb-4 leading-relaxed">
                    XGBoost + Random Forest with SHAP values for every
                    prediction. See exactly which features drove each
                    target&apos;s ranking—no black boxes.
                  </p>
                  <Link
                    href="/how-it-works"
                    className="inline-flex items-center gap-2 text-sm font-bold text-[rgb(var(--sm-accent))] hover:underline"
                  >
                    See the 5-step workflow
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Card>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button asChild variant="sm-primary" size="lg">
                  <Link
                    href="/solutions"
                    className="inline-flex items-center gap-2"
                  >
                    View Solutions
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="sm-secondary" size="lg">
                  <Link href="/how-it-works">How It Works</Link>
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
