"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import { trackEvent } from "@/lib/analytics";
import { useTurnstileSiteKey } from "@/lib/hooks/use-turnstile-site-key";

const COMMODITY_OPTIONS = [
  { value: "lithium", label: "Lithium (Li)" },
  { value: "cobalt", label: "Cobalt (Co)" },
  { value: "nickel", label: "Nickel (Ni)" },
  { value: "rare-earths", label: "Rare Earth Elements (REE)" },
  { value: "pgm", label: "Platinum Group Metals (PGMs)" },
  { value: "graphite", label: "Graphite (C)" },
  { value: "copper", label: "Copper (Cu)" },
  { value: "aluminum", label: "Bauxite / Aluminium" },
  { value: "multi-commodity", label: "Multi-commodity program" },
  { value: "other", label: "Other" },
];

const ROLE_OPTIONS = [
  "VP / Head of Exploration",
  "Exploration Manager",
  "Chief Geologist",
  "Technical Lead / Data Lead",
  "Government / Survey",
  "Investor / Analyst",
  "Other",
];

const DATA_OPTIONS = [
  "Satellite imagery (optical / hyperspectral)",
  "Synthetic aperture radar",
  "Geophysics",
  "Geochemistry",
  "Drilling",
  "Existing targets / AOIs",
  "Other",
];

const STAGE_OPTIONS = [
  "Early regional screening",
  "Target ranking / refinement",
  "Brownfield / near-mine expansion",
  "Infrastructure / geohazard context",
  "Other",
];

const TIMING_OPTIONS = ["0–3 months", "3–6 months", "6–12 months"];

type FormState = {
  name: string;
  email: string;
  company: string;
  role: string;
  regions: string;
  stage: string;
  timing: string;
  context: string;
  consent: boolean;
};

type Props = {
  defaultCommodity?: string;
};

export function ConsultationForm({ defaultCommodity }: Props) {
  const {
    siteKey,
    loading: siteKeyLoading,
    error: siteKeyError,
  } = useTurnstileSiteKey();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    company: "",
    role: "",
    regions: "",
    stage: "",
    timing: "",
    context: "",
    consent: false,
  });
  const defaultCommodityValue = useMemo(() => {
    if (!defaultCommodity) return undefined;
    const normalized = defaultCommodity.toLowerCase();
    const match = COMMODITY_OPTIONS.find(
      (option) => option.value === normalized
    );
    return match ? match.value : undefined;
  }, [defaultCommodity]);
  const [commodities, setCommodities] = useState<string[]>(
    defaultCommodityValue ? [defaultCommodityValue] : []
  );
  const [dataSources, setDataSources] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const widgetRef = useRef<HTMLDivElement | null>(null);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "consent" && "checked" in e.target) {
      const target = e.target as HTMLInputElement;
      setForm((prev) => ({ ...prev, consent: target.checked }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleValue = (
    value: string,
    list: string[],
    setList: (next: string[]) => void
  ) => {
    setList(
      list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value]
    );
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

  const resetWidget = () => {
    setToken(null);
    if (window.turnstile && widgetRef.current) {
      try {
        window.turnstile.reset(widgetRef.current);
      } catch {
        // ignore
      }
    }
  };

  const validateForm = () => {
    if (!form.name.trim() || !form.email.trim() || !form.company.trim()) {
      return "Please provide your name, work email, and company.";
    }
    if (!form.role) {
      return "Select the role that best describes you.";
    }
    if (!form.regions.trim()) {
      return "Share the regions or districts you want to discuss.";
    }
    if (commodities.length === 0) {
      return "Choose at least one commodity.";
    }
    if (!form.stage) {
      return "Select your exploration stage.";
    }
    if (!form.timing) {
      return "Select your preferred timing.";
    }
    if (!form.consent) {
      return "Please confirm you understand the consultation is paid.";
    }
    if (!token) {
      return "Complete the Turnstile check before submitting.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const validation = validateForm();
    if (validation) {
      setError(validation);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          regions: form.regions.trim(),
          context: form.context.trim(),
          commodities,
          dataSources,
          token,
          sourceCommodity: defaultCommodityValue,
        }),
      });
      const data = (await response.json()) as {
        success: boolean;
        message?: string;
        reference?: string;
      };
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Submission failed");
      }

      trackEvent("lead.consultation_request", {
        commodities: commodities.join(","),
        stage: form.stage,
        role: form.role,
        timing: form.timing,
      });

      setSuccess(
        data.reference
          ? `Thanks! Your consultation reference is ${data.reference}. Check your inbox for payment instructions.`
          : "Thanks! Check your inbox for payment instructions."
      );
      setForm({
        name: "",
        email: "",
        company: "",
        role: "",
        regions: "",
        stage: "",
        timing: "",
        context: "",
        consent: false,
      });
      setCommodities(defaultCommodityValue ? [defaultCommodityValue] : []);
      setDataSources([]);
      resetWidget();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-background/80 p-6 shadow-lg shadow-black/5">
      <h2 className="text-2xl font-semibold tracking-tight">
        Request a paid consultation
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Share a few details so we can confirm fit, prepare the right
        specialists, and send you payment instructions.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="mt-1 w-full rounded-xl border border-border/70 bg-transparent px-4 py-2"
              placeholder="Jane Doe"
              value={form.name}
              onChange={onChange}
              autoComplete="name"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="mt-1 w-full rounded-xl border border-border/70 bg-transparent px-4 py-2"
              placeholder="you@company.com"
              value={form.email}
              onChange={onChange}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="company">
              Company / organisation
            </label>
            <input
              id="company"
              name="company"
              type="text"
              className="mt-1 w-full rounded-xl border border-border/70 bg-transparent px-4 py-2"
              placeholder="Acme Mining Ltd."
              value={form.company}
              onChange={onChange}
              autoComplete="organization"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              name="role"
              className="mt-1 w-full rounded-xl border border-border/70 bg-transparent px-4 py-2"
              value={form.role}
              onChange={onChange}
            >
              <option value="">Select role</option>
              {ROLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium" htmlFor="regions">
              Regions of interest
            </label>
            <textarea
              id="regions"
              name="regions"
              rows={3}
              className="mt-1 w-full rounded-xl border border-border/70 bg-transparent px-4 py-2"
              placeholder="E.g. northern Chile, Payas–İslahiye belt, Western Australia."
              value={form.regions}
              onChange={onChange}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">Commodity focus</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {COMMODITY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  className="rounded"
                  checked={commodities.includes(option.value)}
                  onChange={() =>
                    toggleValue(option.value, commodities, setCommodities)
                  }
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">Current data available</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {DATA_OPTIONS.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  className="rounded"
                  checked={dataSources.includes(option)}
                  onChange={() =>
                    toggleValue(option, dataSources, setDataSources)
                  }
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium" htmlFor="stage">
              Exploration stage
            </label>
            <select
              id="stage"
              name="stage"
              className="mt-1 w-full rounded-xl border border-border/70 bg-transparent px-4 py-2"
              value={form.stage}
              onChange={onChange}
            >
              <option value="">Select stage</option>
              {STAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="timing">
              Preferred timing
            </label>
            <select
              id="timing"
              name="timing"
              className="mt-1 w-full rounded-xl border border-border/70 bg-transparent px-4 py-2"
              value={form.timing}
              onChange={onChange}
            >
              <option value="">Select timing</option>
              {TIMING_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="context">
            Additional context (optional)
          </label>
          <textarea
            id="context"
            name="context"
            rows={4}
            className="mt-1 w-full rounded-xl border border-border/70 bg-transparent px-4 py-2"
            placeholder="Anything else we should know before the call?"
            value={form.context}
            onChange={onChange}
          />
        </div>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="consent"
            className="mt-1"
            checked={form.consent}
            onChange={onChange}
          />
          <span>
            I understand this is a paid consultation and my booking is confirmed
            once payment or proof of payment is received.
          </span>
        </label>

        {siteKey ? (
          <div>
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
            {siteKeyLoading
              ? "Loading Turnstile challenge…"
              : siteKeyError ||
                "Turnstile is temporarily unavailable. Please refresh and try again."}
          </p>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-emerald-500">{success}</p>}

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || !token || !siteKey}
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2 text-base font-semibold text-primary-foreground"
          >
            {submitting ? "Submitting…" : "Submit consultation request"}
          </button>
        </div>
      </form>
    </div>
  );
}
