import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/url";

export const metadata: Metadata = {
  title: "Cookie Policy | Scanminers",
  description: "How Scanminers uses cookies and similar technologies on our website.",
  alternates: { canonical: absoluteUrl("/legal/cookies") },
};

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: November 15, 2025</p>
      </header>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">1. What Are Cookies?</h2>
          <p className="text-muted-foreground mb-4">
            Cookies are small text files that are placed on your device (computer, tablet, or mobile phone) when you 
            visit a website. They are widely used to make websites work more efficiently and provide information to 
            website owners.
          </p>
          <p className="text-muted-foreground">
            Cookies help us understand how visitors use our site, remember your preferences, and improve your overall 
            experience.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">2. How We Use Cookies</h2>
          <p className="text-muted-foreground mb-4">
            Scanminers uses cookies for the following purposes:
          </p>

          <h3 className="text-lg font-semibold mb-2 mt-4">Essential Cookies</h3>
          <p className="text-muted-foreground mb-4">
            These cookies are necessary for the website to function properly. They enable core functionality such as:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
            <li>Security and authentication</li>
            <li>Form submission and spam protection (e.g., Cloudflare Turnstile)</li>
            <li>Session management</li>
            <li>Load balancing and performance optimization</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            These cookies cannot be disabled without affecting the functionality of the website.
          </p>

          <h3 className="text-lg font-semibold mb-2 mt-4">Analytics and Performance Cookies</h3>
          <p className="text-muted-foreground mb-4">
            We use analytics tools (such as Google Analytics, Cloudflare Web Analytics, or similar services) to collect 
            information about how visitors use our site. This helps us:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
            <li>Understand which pages are most popular</li>
            <li>Identify technical issues and improve site performance</li>
            <li>Measure the effectiveness of content and design changes</li>
            <li>Analyze traffic sources and user journeys</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            Analytics cookies collect information in an aggregated and anonymized form. They do not identify individual 
            users.
          </p>

          <h3 className="text-lg font-semibold mb-2 mt-4">Preference Cookies</h3>
          <p className="text-muted-foreground mb-4">
            These cookies remember your preferences and choices, such as:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Theme selection (light mode or dark mode)</li>
            <li>Language preferences</li>
            <li>Other personalization settings</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">3. What We Don&apos;t Do</h2>
          <p className="text-muted-foreground mb-4">
            <strong>We do not use advertising or marketing cookies.</strong> Scanminers does not:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Track you across other websites for advertising purposes</li>
            <li>Serve targeted ads based on your browsing behavior</li>
            <li>Share your data with third-party advertisers or data brokers</li>
            <li>Use cookies to build marketing profiles or retarget you elsewhere</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">4. Third-Party Cookies</h2>
          <p className="text-muted-foreground mb-4">
            Some cookies on our site may be set by third-party services we use, such as:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
            <li><strong>Cloudflare:</strong> For security, content delivery, and performance optimization</li>
            <li><strong>Google Analytics:</strong> For website usage analytics (if enabled)</li>
            <li><strong>Sentry:</strong> For error monitoring and performance tracking (if enabled)</li>
          </ul>
          <p className="text-muted-foreground">
            These third parties may use cookies in accordance with their own policies. We recommend reviewing their 
            privacy policies for more information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">5. How to Control Cookies</h2>
          <p className="text-muted-foreground mb-4">
            You have several options to control or limit how cookies are used:
          </p>

          <h3 className="text-lg font-semibold mb-2 mt-4">Browser Settings</h3>
          <p className="text-muted-foreground mb-4">
            Most web browsers allow you to manage cookies through their settings. You can:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
            <li>Block all cookies</li>
            <li>Block third-party cookies only</li>
            <li>Delete cookies after each browsing session</li>
            <li>Receive notifications when cookies are set</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            Here&apos;s how to manage cookies in popular browsers:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
            <li>
              <strong>Google Chrome:</strong> Settings → Privacy and security → Cookies and other site data
            </li>
            <li>
              <strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data
            </li>
            <li>
              <strong>Safari:</strong> Preferences → Privacy → Manage Website Data
            </li>
            <li>
              <strong>Microsoft Edge:</strong> Settings → Privacy, search, and services → Cookies and site data
            </li>
          </ul>

          <h3 className="text-lg font-semibold mb-2 mt-4">Opt Out of Analytics</h3>
          <p className="text-muted-foreground mb-4">
            To opt out of Google Analytics tracking, you can install the{" "}
            <a 
              href="https://tools.google.com/dlpage/gaoptout" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google Analytics Opt-out Browser Add-on
            </a>
            .
          </p>

          <h3 className="text-lg font-semibold mb-2 mt-4">Important Note</h3>
          <p className="text-muted-foreground">
            Disabling cookies may affect the functionality of this website. Essential cookies are required for basic 
            operations like form submissions and security features.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">6. Do Not Track Signals</h2>
          <p className="text-muted-foreground">
            Some browsers support &quot;Do Not Track&quot; (DNT) signals. At present, there is no industry standard for how 
            websites should respond to DNT signals. We respect your privacy preferences and encourage you to use browser 
            settings to control cookies and tracking.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">7. Changes to This Policy</h2>
          <p className="text-muted-foreground">
            We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our 
            practices. The &quot;Last updated&quot; date at the top of this page indicates when the policy was last revised.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">8. More Information</h2>
          <p className="text-muted-foreground mb-4">
            For more details about how we handle your personal information, please see our{" "}
            <Link href="/legal/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
          <p className="text-muted-foreground">
            If you have questions about our use of cookies, please contact us via our{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
