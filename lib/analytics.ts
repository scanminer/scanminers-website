export type AnalyticsEventPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
  }
}

const sanitizePayload = (payload?: AnalyticsEventPayload): Record<string, unknown> => {
  if (!payload) return {};
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
  );
};

export const trackEvent = (name: string, payload: AnalyticsEventPayload = {}): void => {
  if (typeof window === "undefined") return;

  const safePayload = sanitizePayload(payload);

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: name, ...safePayload });
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", name, safePayload);
  }

  if (typeof window.plausible === "function") {
    window.plausible(name, { props: safePayload });
  }
};
