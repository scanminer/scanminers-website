import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found | Scanminers",
  description: "The page you're looking for doesn't exist or has been moved.",
};

export default function NotFound() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-24">
      <div className="mx-auto max-w-xl text-center space-y-8">
        {/* Visual indicator */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue-deep/20 to-brand-green-mineral/20 border border-white/10">
          <Search className="h-10 w-10 text-white/60" strokeWidth={1.5} />
        </div>

        {/* 404 badge */}
        <p className="text-sm font-mono tracking-widest text-white/50 uppercase">
          Error 404
        </p>

        {/* Heading */}
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">
          Page not found
        </h1>

        {/* Description */}
        <p className="text-base text-white/70 leading-relaxed max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/solutions">
              Explore Solutions
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Helpful links */}
        <div className="pt-8 border-t border-white/10">
          <p className="text-sm text-white/50 mb-4">Or try one of these:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/how-it-works"
              className="text-white/70 hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              How It Works
            </Link>
            <Link
              href="/case-studies"
              className="text-white/70 hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Case Studies
            </Link>
            <Link
              href="/insights"
              className="text-white/70 hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Insights
            </Link>
            <Link
              href="/contact"
              className="text-white/70 hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
