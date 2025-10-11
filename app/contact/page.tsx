import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/url";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact | Scanminers",
  description: "Request a demo or talk with our team about your exploration program.",
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: {
    title: "Contact | Scanminers",
    description: "Request a demo or talk with our team about your exploration program.",
    url: absoluteUrl("/contact"),
    type: "website",
    images: [{ url: absoluteUrl("/og-default.svg") }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Scanminers",
    description: "Request a demo or talk with our team about your exploration program.",
    images: [absoluteUrl("/og-default.svg")],
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <main className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Request a Demo</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          We’d love to show you how our prospectivity mapping accelerates discovery while reducing cost and footprint.
        </p>
        <ContactForm />
      </main>
    </div>
  );
}
