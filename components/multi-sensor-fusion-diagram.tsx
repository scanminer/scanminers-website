"use client";

// Simple animated diagram showing multi-sensor fusion flow
// No external deps; CSS transitions only (upgrade to Framer Motion in Phase 2)

export function MultiSensorFusionDiagram() {
  const stages = [
    { label: "ASTER", color: "from-primary/20 to-primary/5" },
    { label: "Landsat", color: "from-primary/20 to-primary/5" },
    { label: "Sentinel", color: "from-primary/20 to-primary/5" },
    { label: "PRISMA", color: "from-primary/20 to-primary/5" },
    { label: "Fusion", color: "from-secondary/20 to-secondary/5" },
    { label: "XGBoost", color: "from-secondary/20 to-secondary/5" },
    { label: "SHAP", color: "from-accent/20 to-accent/5" },
    { label: "Targets", color: "from-accent/20 to-accent/5" },
  ];

  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Multi-sensor fusion</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stages.map((s, i) => (
          <div
            key={s.label}
            className={`group relative overflow-hidden rounded-xl border border-white/15 bg-gradient-to-br ${s.color} p-3 transition-transform duration-300 hover:-translate-y-0.5`}
          >
            <div className="text-xs font-semibold">{s.label}</div>
            {i < stages.length - 1 && i % 2 === 1 && (
              <div className="pointer-events-none absolute -right-2 top-1/2 hidden h-0.5 w-4 -translate-y-1/2 bg-white/40 sm:block" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 text-[11px] text-white/70">ASTER → Landsat → Sentinel → PRISMA → Fusion → XGBoost → SHAP → Targets</div>
    </div>
  );
}
