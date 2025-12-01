"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    location: "",
    commodity: "",
    stage: "concept",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy handler - just log and show success message
    console.log("Form submission:", formData);
    setSubmitted(true);

    // Reset after 5 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        company: "",
        role: "",
        location: "",
        commodity: "",
        stage: "concept",
        message: "",
      });
    }, 5000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <ScrollReveal>
        <section className="py-20 lg:py-32">
          <div className="container mx-auto max-w-4xl px-6 lg:px-8 text-center">
            <Badge variant="primary" className="mb-6">
              Request a Scan
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Tell us about your{" "}
              <span className="text-[rgb(var(--sm-primary))]">
                exploration project
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[rgb(var(--sm-text-muted))] mb-8 leading-relaxed max-w-3xl mx-auto">
              Share your area of interest, target commodities, and project
              stage.{" "}
              <strong className="text-[rgb(var(--sm-text))]">
                We&apos;ll respond with what a Scanminers remote sensing study
                would deliver
              </strong>
              —typically within 48 hours.
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* Form Section */}
      <ScrollReveal>
        <section className="py-16">
          <div className="container mx-auto max-w-3xl px-6 lg:px-8">
            <Card variant="elevated" className="p-8 md:p-12">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(var(--sm-primary)/0.15)] mx-auto mb-6">
                    <svg
                      className="h-8 w-8 text-[rgb(var(--sm-primary))]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-4">
                    Thanks! We&apos;ll be in touch soon.
                  </h2>
                  <p className="text-[rgb(var(--sm-text-muted))] mb-8">
                    We&apos;ve received your inquiry and will respond within 48
                    hours with a preliminary assessment of what a Scanminers
                    study could deliver for your project.
                  </p>
                  <Button
                    onClick={() => setSubmitted(false)}
                    variant="sm-secondary"
                    size="lg"
                  >
                    Submit Another Request
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-semibold text-[rgb(var(--sm-text))] mb-2"
                      >
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-[rgba(var(--sm-border-subtle)/0.7)] bg-[rgba(var(--sm-surface)/0.5)] px-4 py-3 text-[rgb(var(--sm-text))] placeholder:text-[rgb(var(--sm-text-subtle))] focus:border-[rgb(var(--sm-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--sm-primary)/0.2)]"
                        placeholder="Your full name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-[rgb(var(--sm-text))] mb-2"
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-[rgba(var(--sm-border-subtle)/0.7)] bg-[rgba(var(--sm-surface)/0.5)] px-4 py-3 text-[rgb(var(--sm-text))] placeholder:text-[rgb(var(--sm-text-subtle))] focus:border-[rgb(var(--sm-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--sm-primary)/0.2)]"
                        placeholder="you@company.com"
                      />
                    </div>

                    {/* Company */}
                    <div>
                      <label
                        htmlFor="company"
                        className="block text-sm font-semibold text-[rgb(var(--sm-text))] mb-2"
                      >
                        Company *
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        required
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-[rgba(var(--sm-border-subtle)/0.7)] bg-[rgba(var(--sm-surface)/0.5)] px-4 py-3 text-[rgb(var(--sm-text))] placeholder:text-[rgb(var(--sm-text-subtle))] focus:border-[rgb(var(--sm-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--sm-primary)/0.2)]"
                        placeholder="Your company or organization"
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label
                        htmlFor="role"
                        className="block text-sm font-semibold text-[rgb(var(--sm-text))] mb-2"
                      >
                        Role
                      </label>
                      <input
                        type="text"
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-[rgba(var(--sm-border-subtle)/0.7)] bg-[rgba(var(--sm-surface)/0.5)] px-4 py-3 text-[rgb(var(--sm-text))] placeholder:text-[rgb(var(--sm-text-subtle))] focus:border-[rgb(var(--sm-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--sm-primary)/0.2)]"
                        placeholder="e.g., Exploration Manager, Geologist"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label
                        htmlFor="location"
                        className="block text-sm font-semibold text-[rgb(var(--sm-text))] mb-2"
                      >
                        Project Location *
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        required
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-[rgba(var(--sm-border-subtle)/0.7)] bg-[rgba(var(--sm-surface)/0.5)] px-4 py-3 text-[rgb(var(--sm-text))] placeholder:text-[rgb(var(--sm-text-subtle))] focus:border-[rgb(var(--sm-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--sm-primary)/0.2)]"
                        placeholder="Region, country, or coordinates"
                      />
                    </div>

                    {/* Commodity */}
                    <div>
                      <label
                        htmlFor="commodity"
                        className="block text-sm font-semibold text-[rgb(var(--sm-text))] mb-2"
                      >
                        Target Commodity *
                      </label>
                      <input
                        type="text"
                        id="commodity"
                        name="commodity"
                        required
                        value={formData.commodity}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-[rgba(var(--sm-border-subtle)/0.7)] bg-[rgba(var(--sm-surface)/0.5)] px-4 py-3 text-[rgb(var(--sm-text))] placeholder:text-[rgb(var(--sm-text-subtle))] focus:border-[rgb(var(--sm-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--sm-primary)/0.2)]"
                        placeholder="e.g., Lithium, Copper, REEs"
                      />
                    </div>
                  </div>

                  {/* Project Stage */}
                  <div>
                    <label
                      htmlFor="stage"
                      className="block text-sm font-semibold text-[rgb(var(--sm-text))] mb-2"
                    >
                      Project Stage *
                    </label>
                    <select
                      id="stage"
                      name="stage"
                      required
                      value={formData.stage}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-[rgba(var(--sm-border-subtle)/0.7)] bg-[rgba(var(--sm-surface)/0.5)] px-4 py-3 text-[rgb(var(--sm-text))] focus:border-[rgb(var(--sm-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--sm-primary)/0.2)]"
                    >
                      <option value="concept">Concept / Greenfield</option>
                      <option value="early">Early Exploration</option>
                      <option value="advanced">Advanced Exploration</option>
                      <option value="production">
                        Near Production / Development
                      </option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-semibold text-[rgb(var(--sm-text))] mb-2"
                    >
                      Additional Details
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-[rgba(var(--sm-border-subtle)/0.7)] bg-[rgba(var(--sm-surface)/0.5)] px-4 py-3 text-[rgb(var(--sm-text))] placeholder:text-[rgb(var(--sm-text-subtle))] focus:border-[rgb(var(--sm-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--sm-primary)/0.2)] resize-none"
                      placeholder="Tell us more about your project, existing data, or specific questions..."
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="sm-primary"
                      size="lg"
                      className="w-full"
                    >
                      <span className="inline-flex items-center gap-2">
                        Submit Request
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </Button>
                  </div>

                  <p className="text-xs text-center text-[rgb(var(--sm-text-subtle))]">
                    By submitting this form, you agree to be contacted about
                    Scanminers services.
                  </p>
                </form>
              )}
            </Card>
          </div>
        </section>
      </ScrollReveal>

      {/* Secondary Contact Info */}
      <ScrollReveal>
        <section className="py-16 pb-24">
          <div className="container mx-auto max-w-3xl px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Prefer to reach out directly?
              </h2>
              <p className="text-[rgb(var(--sm-text-muted))]">
                We&apos;re here to answer questions about prospectivity mapping,
                data requirements, or engagement models.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card variant="default" className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(var(--sm-primary)/0.15)]">
                    <Mail className="h-5 w-5 text-[rgb(var(--sm-primary))]" />
                  </div>
                  <h3 className="font-bold">Email</h3>
                </div>
                <a
                  href="mailto:hello@scanminers.com"
                  className="text-sm text-[rgb(var(--sm-primary))] hover:underline"
                >
                  hello@scanminers.com
                </a>
              </Card>

              <Card variant="default" className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(var(--sm-accent)/0.15)]">
                    <MapPin className="h-5 w-5 text-[rgb(var(--sm-accent))]" />
                  </div>
                  <h3 className="font-bold">Resources</h3>
                </div>
                <Link
                  href="/case-studies"
                  className="text-sm text-[rgb(var(--sm-accent))] hover:underline"
                >
                  View Case Studies →
                </Link>
              </Card>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
