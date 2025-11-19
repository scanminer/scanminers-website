"use client";

import { useEffect, useState } from "react";

type TurnstileSiteKeyState = {
  siteKey: string | null;
  loading: boolean;
  error: string | null;
};

const PUBLIC_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || null;

/**
 * Ensures Turnstile site key is available even if NEXT_PUBLIC envs were missing during build.
 * Falls back to fetching the value from `/api/public-config` at runtime.
 */
export function useTurnstileSiteKey(): TurnstileSiteKeyState {
  const [siteKey, setSiteKey] = useState<string | null>(PUBLIC_KEY);
  const [loading, setLoading] = useState(!PUBLIC_KEY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (siteKey) {
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function loadSiteKey() {
      try {
        setLoading(true);
        const response = await fetch("/api/public-config", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(
            `Failed to fetch Turnstile config: ${response.status}`
          );
        }

        // Check content type before parsing JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid response format from config endpoint");
        }

        const data: { turnstileSiteKey?: string | null } =
          await response.json();
        if (!cancelled) {
          if (data.turnstileSiteKey) {
            setSiteKey(data.turnstileSiteKey);
            setError(null);
          } else {
            setError("Turnstile site key is missing on the server.");
          }
        }
      } catch (fetchError) {
        if (!cancelled) {
          console.error("[Turnstile] Failed to load site key", fetchError);
          setError(
            "Unable to load Turnstile configuration. Please try again later."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSiteKey();

    return () => {
      cancelled = true;
    };
  }, [siteKey]);

  return { siteKey, loading, error };
}
