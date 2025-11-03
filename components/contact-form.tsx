"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "refresh-expired"?: "auto" | "manual";
          theme?: "auto" | "light" | "dark";
          size?: "normal" | "compact" | "invisible";
        }
      ) => void;
      reset: (el?: HTMLElement) => void;
      remove: (el: HTMLElement) => void;
    };
  }
}

type FormState = {
  name: string;
  email: string;
  company: string;
  message: string;
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", company: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const renderTurnstile = useCallback(() => {
    if (!widgetRef.current || !window.turnstile || !siteKey) return;
    try {
      window.turnstile.render(widgetRef.current, {
        sitekey: siteKey,
        "refresh-expired": "auto",
        theme: "auto",
        callback: (t) => setToken(t),
      });
    } catch {
      // ignore render errors
    }
  }, [siteKey]);

  useEffect(() => {
    if (!siteKey) return;
    if (window.turnstile) {
      setScriptReady(true);
      return;
    }
  }, [siteKey]);

  useEffect(() => {
    if (scriptReady) {
      renderTurnstile();
    }
  }, [scriptReady, renderTurnstile]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in your name, email, and message.");
      return;
    }
    if (!token) {
      setError("Please complete the Turnstile check before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          company: form.company.trim(),
          message: form.message.trim(),
          token,
        }),
      });
      const data = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Submission failed");
      }
      setSuccess("Thanks! Your message has been received. We'll be in touch shortly.");
      setForm({ name: "", email: "", company: "", message: "" });
      setToken(null);
      // Reset the widget if available
      if (window.turnstile && widgetRef.current) {
        try {
          window.turnstile.reset(widgetRef.current);
        } catch {}
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-md border border-[color:var(--border-color)] bg-white p-4 shadow-sm">
      <h2 className="text-xl font-semibold">Contact</h2>
      <p className="mt-2">Team Lead: <strong>Dr. Amin Beiranvand Pour</strong></p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1 text-[color:var(--muted-foreground)]">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={onChange}
            required
            className="w-full rounded-md border border-[color:var(--border-color)] bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Jane Doe"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1 text-[color:var(--muted-foreground)]">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            required
            className="w-full rounded-md border border-[color:var(--border-color)] bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
            placeholder="jane@company.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium mb-1 text-[color:var(--muted-foreground)]">Company</label>
          <input
            id="company"
            name="company"
            type="text"
            value={form.company}
            onChange={onChange}
            className="w-full rounded-md border border-[color:var(--border-color)] bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Acme Exploration"
            autoComplete="organization"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1 text-[color:var(--muted-foreground)]">Message</label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={onChange}
            required
            rows={5}
            className="w-full rounded-md border border-[color:var(--border-color)] bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Tell us a bit about your targets and timeline…"
          />
        </div>

        {/* Turnstile */}
        {siteKey ? (
          <div>
            {/* Load the Turnstile script explicitly once */}
            {!scriptReady && (
              <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                strategy="afterInteractive"
                onLoad={() => setScriptReady(true)}
              />
            )}
            <div ref={widgetRef} className="cf-turnstile" />
          </div>
        ) : (
          <p className="text-sm text-amber-600">
            Turnstile is not configured. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY to enable submissions.
          </p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || !token}
            className="inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send Message"}
          </button>
        </div>
      </form>
    </div>
  );
}
