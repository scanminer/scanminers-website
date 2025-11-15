import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Search } from "@/components/Search";
import { Suspense } from "react";
import { SentryInit } from "@/components/SentryInit";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "./providers";
import { ModeToggle } from "@/components/mode-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scanminers",
  description: "Geospatial AI for mineral exploration: insights, case studies, and research.",
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Scanminers",
      "url": "https://www.scanminers.com",
      "description": "GeoAI platform for critical minerals exploration using multi-sensor remote sensing and explainable AI.",
      "founder": [
        {
          "@type": "Person",
          "name": "Dr. Amin Beiranvand Pour",
          "jobTitle": "Co-Founder & Chief Scientist"
        },
        {
          "@type": "Person",
          "name": "Mahmood Asadi",
          "jobTitle": "Co-Founder & Chief AI & Product Architect"
        }
      ]
    })
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cfAnalyticsToken = process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN;
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Suspense fallback={null}><SentryInit /></Suspense>
        <ThemeProvider>
          <Providers>
            {/* Slim accent line with gradient */}
            <div className="fixed top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary z-50 pointer-events-none" />
            
            <header className="sticky top-1 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 shadow-sm">
              <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
                {/* Logo with enhanced styling */}
                <Link href="/" className="group flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                    <span className="text-sm font-bold text-white">S</span>
                  </div>
                  <span className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
                    Scanminers
                  </span>
                </Link>
                
                {/* Main Navigation - Desktop */}
                <div className="hidden items-center gap-8 lg:flex">
                  <Link 
                    href="/about" 
                    className="text-sm font-medium text-muted hover:text-primary transition-colors relative group"
                  >
                    About
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
                  </Link>
                  <Link 
                    href="/technologies" 
                    className="text-sm font-medium text-muted hover:text-primary transition-colors relative group"
                  >
                    Technologies
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
                  </Link>
                  <Link 
                    href="/insights" 
                    className="text-sm font-medium text-muted hover:text-primary transition-colors relative group"
                  >
                    Insights
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
                  </Link>
                  <Link 
                    href="/case-studies" 
                    className="text-sm font-medium text-muted hover:text-primary transition-colors relative group"
                  >
                    Case Studies
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
                  </Link>
                  <Link 
                    href="/contact" 
                    className="text-sm font-medium text-muted hover:text-primary transition-colors relative group"
                  >
                    Contact
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
                  </Link>
                </div>
                
                {/* Right side: CTAs + Utilities */}
                <div className="flex items-center gap-3">
                  <Link
                    href="/prospectivity-brief"
                    className="hidden rounded-lg border-2 border-border bg-background px-4 py-2 text-xs font-semibold hover:border-primary hover:bg-card transition-all sm:inline-flex"
                  >
                    Free Brief
                  </Link>
                  <Link
                    href="/consultation"
                    className="hidden rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-fg shadow-md hover:bg-primary/90 hover:shadow-lg transition-all sm:inline-flex"
                  >
                    Consult
                  </Link>
                  <div className="flex items-center gap-2">
                    <Search />
                    <ModeToggle />
                  </div>
                </div>
              </nav>
            </header>
            <main>{children}</main>
            <footer className="border-t border-border bg-muted/30 mt-16">
              <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Company */}
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Company</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                          About
                        </Link>
                      </li>
                      <li>
                        <Link href="/technologies" className="text-sm text-muted-foreground hover:text-foreground">
                          Technologies
                        </Link>
                      </li>
                      <li>
                        <Link href="/partners" className="text-sm text-muted-foreground hover:text-foreground">
                          Partners
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Resources */}
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Resources</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/insights" className="text-sm text-muted-foreground hover:text-foreground">
                          Insights
                        </Link>
                      </li>
                      <li>
                        <Link href="/case-studies" className="text-sm text-muted-foreground hover:text-foreground">
                          Case Studies
                        </Link>
                      </li>
                      <li>
                        <Link href="/prospectivity-brief" className="text-sm text-muted-foreground hover:text-foreground">
                          Prospectivity Brief
                        </Link>
                      </li>
                      <li>
                        <Link href="/consultation" className="text-sm text-muted-foreground hover:text-foreground">
                          Consultation
                        </Link>
                      </li>
                      <li>
                        <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                          Contact
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Legal */}
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/legal/terms" className="text-sm text-muted-foreground hover:text-foreground">
                          Terms of Use
                        </Link>
                      </li>
                      <li>
                        <Link href="/legal/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                          Privacy Policy
                        </Link>
                      </li>
                      <li>
                        <Link href="/legal/cookies" className="text-sm text-muted-foreground hover:text-foreground">
                          Cookie Policy
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    © {new Date().getFullYear()} Scanminers. All rights reserved.
                  </p>
                </div>
              </div>
            </footer>
          </Providers>
        </ThemeProvider>
        {cfAnalyticsToken ? (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{\"token\":\"${cfAnalyticsToken}\"}`}
          />
        ) : null}
      </body>
    </html>
  );
}
