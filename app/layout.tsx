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
            {/* Slim sticky top accent line */}
            <div className="fixed top-0 inset-x-0 h-0.5 bg-primary/80 z-50 pointer-events-none" />
            <header className="sticky top-0 z-40 border-b border-border bg-bg/70 backdrop-blur supports-[backdrop-filter]:bg-bg/60">
              <nav className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 p-4">
                <Link href="/" className="font-semibold">Scanminers</Link>
                <div className="flex flex-1 flex-wrap items-center justify-end gap-3 text-xs font-semibold tracking-wide sm:text-sm">
                  <Link href="/insights" className="hover:underline uppercase">Insights</Link>
                  <Link href="/case-studies" className="hover:underline uppercase">Case Studies</Link>
                  <Link href="/technologies" className="hover:underline uppercase">Technologies</Link>
                  <Link href="/contact" className="hover:underline uppercase">Contact</Link>
                  <Link
                    href="/prospectivity-brief"
                    className="rounded-lg border border-fg/40 px-3 py-2 text-[0.7rem] uppercase text-fg hover:bg-fg/5 sm:text-xs"
                  >
                    Prospectivity Brief
                  </Link>
                  <Link
                    href="/consultation"
                    className="rounded-lg bg-primary px-3 py-2 text-[0.7rem] uppercase text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:bg-primary/90 sm:text-xs"
                  >
                    Consultation
                  </Link>
                  <Search />
                  <ModeToggle />
                </div>
              </nav>
            </header>
            <main>{children}</main>
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
