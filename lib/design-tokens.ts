/**
 * Scanminers Brand Design System
 * Core design tokens for consistent UI/UX across the platform
 */

export const designTokens = {
  // Brand Colors
  colors: {
    // Primary: Teal/Cyan (remote sensing, technology, trust)
    primary: {
      50: '#f0fdff',
      100: '#ccf7fe',
      200: '#99eefd',
      300: '#5ce0fa',
      400: '#22c9f0',
      500: '#06aed6',
      600: '#088bb3',
      700: '#0e7091',
      800: '#155b75',
      900: '#154c63',
      950: '#083144',
    },
    // Secondary: Earth tones (geology, minerals, ground truth)
    earth: {
      50: '#f8f7f4',
      100: '#eeeae0',
      200: '#ddd4c0',
      300: '#c7b89a',
      400: '#b09a73',
      500: '#a08459',
      600: '#93734d',
      700: '#7a5d41',
      800: '#654e39',
      900: '#544131',
      950: '#2e2219',
    },
    // Accent: Warm orange/amber (energy, discovery, highlights)
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
    // Success: Green (validation, accuracy, positive results)
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
      primary: 'linear-gradient(135deg, rgba(6, 174, 214, 0.1) 0%, rgba(8, 139, 179, 0.05) 100%)',
      earth: 'linear-gradient(135deg, rgba(160, 132, 89, 0.1) 0%, rgba(122, 93, 65, 0.05) 100%)',
      accent: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
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
