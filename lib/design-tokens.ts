/**
 * Scanminers Brand Design System
 * Core design tokens for consistent UI/UX across the platform
 */

export const designTokens = {
  // Brand Colors
  colors: {
    // Primary (V2): AI Deep Blue (technology, trust)
    primary: {
      50: '#eff6fc',
      100: '#d9e7f4',
      200: '#b6cfeb',
      300: '#86b0dc',
      400: '#578ec8',
      500: '#2c75ad',
      600: '#1d5f95',
      700: '#0c3f6b', // AI deep blue
      800: '#0a3559',
      900: '#082a46',
      950: '#04182b',
    },
    // Secondary (V2): Exploration Green (geology, field-ready)
    earth: {
      50: '#ecf8f2',
      100: '#d4efdf',
      200: '#a8dfc0',
      300: '#7acc9f',
      400: '#4fbf85',
      500: '#0f8c55', // exploration green
      600: '#0d7b4b',
      700: '#0b6a41',
      800: '#095636',
      900: '#06432a',
      950: '#042a1a',
    },
    // Accent (V2): Mineral Amber (energy, discovery, highlights)
    accent: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde58a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    // Success: System green (validation, accuracy, positive)
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    // Neutrals: Refined grays with warm undertones
    neutral: {
      50: '#fafaf9',
      100: '#f5f5f4',
      200: '#e7e5e4',
      300: '#d6d3d1',
      400: '#a8a29e',
      500: '#78716c',
      600: '#57534e',
      700: '#44403c',
      800: '#292524',
      900: '#1c1917',
      950: '#0c0a09',
    },
  },

  // Typography Scale
  typography: {
    fonts: {
      sans: 'var(--font-geist-sans)',
      mono: 'var(--font-geist-mono)',
    },
    sizes: {
      // Display (hero headlines)
      'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }], // 72px
      'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }], // 60px
      'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' }], // 48px
      
      // Headings
      'h1': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }], // 36px
      'h2': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.005em', fontWeight: '600' }], // 30px
      'h3': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }], // 24px
      'h4': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }], // 20px
      'h5': ['1.125rem', { lineHeight: '1.5', fontWeight: '600' }], // 18px
      
      // Body text
      'body-xl': ['1.25rem', { lineHeight: '1.6', fontWeight: '400' }], // 20px
      'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }], // 18px
      'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }], // 16px
      'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }], // 14px
      'body-xs': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }], // 12px
    },
  },

  // Spacing Scale (based on 4px base unit)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
    40: '10rem',    // 160px
    48: '12rem',    // 192px
    56: '14rem',    // 224px
    64: '16rem',    // 256px
  },

  // Border Radius
  radius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Shadows (light/depth hierarchy)
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },

  // Transitions
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Breakpoints (mobile-first)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Visual Motifs
  motifs: {
    // Topographic contour lines (use in backgrounds)
    contours: {
      stroke: '1px',
      opacity: '0.1',
      pattern: 'wavy',
    },
    // Satellite grid overlay
    grid: {
      size: '32px',
      opacity: '0.05',
      color: 'currentColor',
    },
    // Gradient overlays (for hero sections)
    gradients: {
      primary: 'linear-gradient(135deg, rgba(12, 63, 107, 0.18) 0%, rgba(12, 63, 107, 0.06) 100%)',
      earth: 'linear-gradient(135deg, rgba(15, 140, 85, 0.16) 0%, rgba(15, 140, 85, 0.06) 100%)',
      accent: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(245, 158, 11, 0.06) 100%)',
      dark: 'linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.3) 100%)',
    },
  },
} as const;

// Helper function to get color with opacity
export const withOpacity = (color: string, opacity: number) => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};

// Type exports for TypeScript
export type DesignTokens = typeof designTokens;
export type ColorScale = keyof typeof designTokens.colors;
