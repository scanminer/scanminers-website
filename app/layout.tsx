import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Search } from "@/components/Search";
import { Suspense } from "react";
import { SentryInit } from "@/components/SentryInit";
import Script from "next/script";

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
    <html lang="en">
      <head>
        <Script 
          id="netlify-identity-widget" 
          src="https://identity.netlify.com/v1/netlify-identity-widget.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
  <Suspense fallback={null}><SentryInit /></Suspense>
        <header className="border-b border-black/10 dark:border-white/10">
          <nav className="max-w-5xl mx-auto flex items-center justify-between p-4">
            <Link href="/" className="font-semibold">Scanminers</Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/insights" className="hover:underline">Insights</Link>
              <Link href="/case-studies" className="hover:underline">Case Studies</Link>
              <Link href="/technologies" className="hover:underline">Technologies</Link>
              <Link href="/contact" className="hover:underline">Contact</Link>
              <Search />
            </div>
          </nav>
        </header>
        <main>{children}</main>
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
