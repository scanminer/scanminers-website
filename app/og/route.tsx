import { ImageResponse } from 'next/og';

// Minimal inline brand palette to avoid external JSON dependency in this minimal PR
const brand = {
  colors: {
    bg: '#0b1120', // slate-950
    fg: '#e5e7eb', // gray-200
    primary: '#f97316', // orange-500
    accent: '#14b8a6', // teal-500
    muted: '#9ca3af', // gray-400
    stroke: '#334155', // slate-700
  },
};

// Quick colorway mapping derived from tokens
const colorways = {
  'slate-orange': {
    bg: brand.colors.bg,
    fg: brand.colors.fg,
    accent: brand.colors.primary,
  },
  'slate-teal': {
    bg: brand.colors.bg,
    fg: brand.colors.fg,
    accent: brand.colors.accent,
  },
} as const;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get('title') || 'Scanminers').slice(0, 120);
  const kicker = (searchParams.get('kicker') || 'Insights').slice(0, 40);
  const colorway = (searchParams.get('colorway') || 'slate-orange') as keyof typeof colorways;
  const { bg, fg, accent } = colorways[colorway] ?? colorways['slate-orange'];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 80,
          background: bg,
          color: fg,
          fontSize: 48,
          fontFamily: 'Inter, system-ui',
          position: 'relative',
        }}
      >
        {/* Accent stripe */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(600px 200px at 40% 20%, ${accent}22, transparent 70%)`,
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1280 }}>
          <div style={{ fontSize: 28, letterSpacing: 2, textTransform: 'uppercase', color: brand.colors.muted }}>
            {kicker}
          </div>
          <div style={{ fontSize: 80, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                background: accent,
                boxShadow: `0 0 40px ${accent}66`,
              }}
            />
            <div style={{ fontSize: 26, color: brand.colors.muted }}>scanminers.com</div>
          </div>
        </div>
        {/* Corner mark */}
        <div
          style={{
            position: 'absolute',
            right: 80,
            bottom: 80,
            border: `2px solid ${brand.colors.stroke}`,
            borderRadius: 16,
            padding: '10px 14px',
            fontSize: 24,
            color: brand.colors.muted,
          }}
        >
          On-Brand Cover
        </div>
      </div>
    ),
    {
      width: 1920,
      height: 1080,
    }
  );
}
