import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/url";

export const metadata: Metadata = {
  title: "Terms of Use | Scanminers",
  description: "Terms and conditions for using the Scanminers platform and services.",
  alternates: { canonical: absoluteUrl("/legal/terms") },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">Terms of Use</h1>
        <p className="text-sm text-muted-foreground">Last updated: November 15, 2025</p>
      </header>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">1. Overview</h2>
          <p className="text-muted-foreground mb-4">
            Welcome to Scanminers. By accessing or using this website and our services, you agree to these Terms of Use. 
            This site provides information about our GeoAI platform for critical minerals exploration. All content, 
            tools, and outputs are provided for informational and decision-support purposes only.
          </p>
          <p className="text-muted-foreground">
            We make no guarantees regarding the completeness, accuracy, or suitability of any information or analysis 
            for any particular purpose. Users are responsible for conducting their own due diligence and validation.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">2. Intellectual Property</h2>
          <p className="text-muted-foreground mb-4">
            All content on this website—including text, images, graphics, code, methodologies, and documentation—is 
            the property of Scanminers or its licensors and is protected by copyright, trademark, and other intellectual 
            property laws.
          </p>
          <p className="text-muted-foreground">
            You may view and download content for personal, non-commercial use only. Any reproduction, distribution, 
            modification, or commercial use requires prior written permission from Scanminers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">3. Services and Outputs</h2>
          <p className="text-muted-foreground mb-4">
            Scanminers provides geospatial intelligence, prospectivity assessments, and exploration decision-support 
            tools. All outputs are based on remote sensing data, machine learning models, and geological interpretation.
          </p>
          <p className="text-muted-foreground mb-4">
            <strong>No Warranties:</strong> Our services and outputs are provided &quot;as is&quot; without warranty of any kind, 
            express or implied. We do not guarantee discovery outcomes, investment returns, or operational success.
          </p>
          <p className="text-muted-foreground">
            Users acknowledge that exploration and mining involve inherent geological, financial, and operational risks 
            that are beyond our control.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">4. Limitation of Liability</h2>
          <p className="text-muted-foreground mb-4">
            To the fullest extent permitted by law, Scanminers and its founders, employees, and partners shall not be 
            liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of 
            this website or our services.
          </p>
          <p className="text-muted-foreground">
            This includes, but is not limited to, damages for loss of profits, revenue, data, or opportunity, even if 
            we have been advised of the possibility of such damages.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">5. User Conduct</h2>
          <p className="text-muted-foreground mb-4">
            You agree not to:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Use this website or our services for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to our systems or data</li>
            <li>Interfere with the proper functioning of the website</li>
            <li>Reproduce, redistribute, or reverse-engineer our methodologies or software</li>
            <li>Misrepresent your affiliation or authorization when contacting us</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">6. Third-Party Links and Data</h2>
          <p className="text-muted-foreground mb-4">
            This website may contain links to third-party websites or reference third-party data sources. Scanminers 
            is not responsible for the content, accuracy, or availability of external sites or data.
          </p>
          <p className="text-muted-foreground">
            Your use of third-party services or data is governed by their respective terms and policies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">7. Changes to Terms</h2>
          <p className="text-muted-foreground">
            We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon 
            posting to this page. Your continued use of the website after changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">8. Governing Law</h2>
          <p className="text-muted-foreground">
            These Terms of Use shall be governed by and construed in accordance with applicable laws. Any disputes 
            arising from these terms or your use of our services shall be resolved through appropriate legal channels.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">9. Contact</h2>
          <p className="text-muted-foreground">
            If you have questions about these Terms of Use, please contact us via our{" "}
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
