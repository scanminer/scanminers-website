import type { Config } from "tailwindcss";
import tokens from "./design/brand.tokens.json" assert { type: "json" };

export default {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: tokens.colors.bg,
        fg: tokens.colors.fg,
        primary: tokens.colors.primary,
        accent: tokens.colors.accent,
        muted: tokens.colors.muted,
        stroke: tokens.colors.stroke,
      },
      fontFamily: {
        sans: tokens.fonts.sans.split(",").map((s) => s.trim()),
        mono: tokens.fonts.mono.split(",").map((s) => s.trim()),
      },
      borderRadius: {
        mdx: `${tokens.radii.md}px`,
        lgx: `${tokens.radii.lg}px`,
      },
      boxShadow: {
        card: tokens.shadow.card,
      },
    },
  },
} satisfies Config;
