import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Suspense } from "react";
import { SentryInit } from "@/components/SentryInit";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "./providers";
import { Header } from "@/components/header";

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
            <Header />
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
