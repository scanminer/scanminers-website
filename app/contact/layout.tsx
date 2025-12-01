import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/url";

export const metadata: Metadata = {
  title: "Contact | Scanminers",
  description:
    "Get in touch with the Scanminers team. Tell us about your exploration challenge and we'll respond within 24 hours.",
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: {
    title: "Contact | Scanminers",
    description:
      "Get in touch with the Scanminers team. Tell us about your exploration challenge.",
    url: absoluteUrl("/contact"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Scanminers",
    description:
      "Get in touch with the Scanminers team. Tell us about your exploration challenge.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
