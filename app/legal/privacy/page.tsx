import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/url";

export const metadata: Metadata = {
  title: "Privacy Policy | Scanminers",
  description: "How Scanminers collects, uses, and protects your personal information.",
  alternates: { canonical: absoluteUrl("/legal/privacy") },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: November 15, 2025</p>
      </header>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
          <p className="text-muted-foreground mb-4">
            Scanminers is committed to protecting your privacy. This Privacy Policy explains how we collect, use, 
            store, and protect information when you use our website and services.
          </p>
          <p className="text-muted-foreground">
            By using this website, you consent to the practices described in this policy. If you do not agree with 
            these practices, please do not use our site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
          
          <h3 className="text-lg font-semibold mb-2 mt-4">Information You Provide</h3>
          <p className="text-muted-foreground mb-4">
            When you contact us or request services, we may collect:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
            <li>Name and professional title</li>
            <li>Email address</li>
            <li>Organization or company name</li>
            <li>Phone number (if provided)</li>
            <li>Project details, regions of interest, and exploration goals</li>
            <li>Any other information you choose to share in messages or forms</li>
          </ul>

          <h3 className="text-lg font-semibold mb-2 mt-4">Automatically Collected Information</h3>
          <p className="text-muted-foreground mb-4">
            When you visit our website, we may automatically collect:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>IP address and approximate geographic location</li>
            <li>Browser type, device type, and operating system</li>
            <li>Pages visited, time spent on pages, and navigation patterns</li>
            <li>Referral source (how you arrived at our site)</li>
            <li>Technical information for performance monitoring and security</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
          <p className="text-muted-foreground mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Respond to inquiries and provide requested information or services</li>
            <li>Deliver prospectivity briefs, consultations, and other professional services</li>
            <li>Improve our website, products, and user experience</li>
            <li>Analyze usage patterns and understand visitor interests</li>
            <li>Communicate updates, insights, or relevant opportunities (with your consent)</li>
            <li>Comply with legal obligations and protect against fraud or misuse</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">4. How We Protect Your Information</h2>
          <p className="text-muted-foreground mb-4">
            We implement appropriate technical and organizational measures to protect your personal information, including:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
            <li>Secure data transmission via HTTPS encryption</li>
            <li>Access controls and authentication for internal systems</li>
            <li>Regular security audits and monitoring</li>
            <li>Data minimization—we only collect what we need</li>
          </ul>
          <p className="text-muted-foreground">
            However, no method of transmission or storage is 100% secure. While we strive to protect your information, 
            we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">5. Sharing Your Information</h2>
          <p className="text-muted-foreground mb-4">
            <strong>We do not sell, rent, or trade your personal information.</strong>
          </p>
          <p className="text-muted-foreground mb-4">
            We may share information only in the following limited circumstances:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>
              <strong>Service Providers:</strong> We may share information with trusted third-party providers who help 
              us operate our website and deliver services (e.g., email delivery, analytics, hosting). These providers 
              are contractually obligated to protect your information.
            </li>
            <li>
              <strong>Legal Requirements:</strong> We may disclose information if required by law, court order, or 
              governmental authority.
            </li>
            <li>
              <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your 
              information may be transferred as part of that transaction.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">6. Email Communications</h2>
          <p className="text-muted-foreground mb-4">
            If you provide your email address, we may use it to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
            <li>Respond to your inquiries and requests</li>
            <li>Send information about services you&apos;ve requested</li>
            <li>Share occasional updates, insights, or relevant opportunities (with your consent)</li>
          </ul>
          <p className="text-muted-foreground">
            <strong>We will never send unsolicited marketing emails or spam.</strong> You can opt out of non-essential 
            communications at any time by contacting us or using unsubscribe links in emails.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">7. Cookies and Analytics</h2>
          <p className="text-muted-foreground mb-4">
            We use cookies and similar technologies to improve your experience and understand how our site is used. 
            For detailed information, please see our{" "}
            <Link href="/legal/cookies" className="text-primary hover:underline">
              Cookie Policy
            </Link>
            .
          </p>
          <p className="text-muted-foreground">
            We may use analytics services (such as Google Analytics or Cloudflare Analytics) to collect aggregated, 
            anonymized data about site usage. These services may use cookies to track visitor behavior across websites.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">8. Your Rights</h2>
          <p className="text-muted-foreground mb-4">
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
            <li><strong>Access:</strong> Request a copy of the information we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
            <li><strong>Deletion:</strong> Request deletion of your information (subject to legal requirements)</li>
            <li><strong>Objection:</strong> Object to certain types of processing</li>
            <li><strong>Portability:</strong> Request your data in a structured, machine-readable format</li>
          </ul>
          <p className="text-muted-foreground">
            To exercise these rights, please contact us via our{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact page
            </Link>
            . We will respond to your request in accordance with applicable laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">9. Data Retention</h2>
          <p className="text-muted-foreground">
            We retain personal information only as long as necessary to fulfill the purposes for which it was collected, 
            comply with legal obligations, resolve disputes, and enforce our agreements. When information is no longer 
            needed, we securely delete or anonymize it.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">10. Third-Party Links</h2>
          <p className="text-muted-foreground">
            Our website may contain links to external sites. We are not responsible for the privacy practices or content 
            of third-party websites. We encourage you to review the privacy policies of any sites you visit.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">11. Children&apos;s Privacy</h2>
          <p className="text-muted-foreground">
            Our services are not directed at individuals under the age of 18. We do not knowingly collect personal 
            information from children. If we become aware that we have inadvertently collected such information, we 
            will take steps to delete it.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">12. Changes to This Policy</h2>
          <p className="text-muted-foreground">
            We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
            The &quot;Last updated&quot; date at the top of this page indicates when the policy was last revised. We encourage 
            you to review this policy periodically.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
          <p className="text-muted-foreground">
            If you have questions or concerns about this Privacy Policy or how we handle your information, please 
            contact us via our{" "}
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
