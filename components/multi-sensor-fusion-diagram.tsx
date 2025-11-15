"use client";

import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

// Animated diagram showing multi-sensor fusion flow (Phase 2)
export function MultiSensorFusionDiagram() {
  const prefersReducedMotion = useReducedMotion();
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
  const shapIdx = stages.findIndex((s) => s.label === "SHAP");
  const targetsIdx = stages.findIndex((s) => s.label === "Targets");
  const fusionIdx = stages.findIndex((s) => s.label === "Fusion");

  const container: Variants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : {
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.08, delayChildren: 0.15 },
        },
      };

  const item: Variants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { y: 8, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
      };

  return (
    <motion.div
      className="rounded-2xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Multi-sensor fusion</p>
      <motion.div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stages.map((s, i) => (
          <motion.div
            key={s.label}
            variants={item}
            whileHover={prefersReducedMotion ? undefined : { y: -2 }}
            className={`group relative overflow-hidden rounded-xl border border-white/15 bg-gradient-to-br ${s.color} p-3`}
          >
            <div className="text-xs font-semibold">{s.label}</div>
            {/* Fusion shimmer: subtle moving highlight to indicate blending */}
            {i === fusionIdx && !prefersReducedMotion && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{
                  background:
                    "linear-gradient(120deg, transparent 30%, rgba(16,185,129,0.25) 50%, transparent 70%)",
                  backgroundSize: "200% 100%",
                }}
                initial={{ backgroundPositionX: "0%", opacity: 0.0 }}
                whileInView={{ backgroundPositionX: ["0%", "200%"], opacity: 1 }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            {/* SHAP emphasis: subtle pulsing glow + badge */}
            {i === shapIdx && (
              <ShapEmphasis prefersReducedMotion={!!prefersReducedMotion} />
            )}

            {/* Targets emphasis: quick tick highlight once in view */}
            {i === targetsIdx && !prefersReducedMotion && (
              <motion.span
                className="absolute right-2 bottom-2 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] text-white/80"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1, transition: { delay: 0.4 } }}
              >
                ranked targets
              </motion.span>
            )}
            {/* Connecting line (animate width) */}
            {i < stages.length - 1 && i % 2 === 1 && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -right-2 top-1/2 hidden h-0.5 -translate-y-1/2 bg-white/40 sm:block"
                initial={prefersReducedMotion ? { width: 16 } : { width: 0 }}
                animate={prefersReducedMotion ? undefined : { width: 16 }}
                transition={{ delay: 0.2 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        className="mt-3 text-[11px] text-white/70"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        ASTER → Landsat → Sentinel → PRISMA → Fusion → XGBoost → SHAP → Targets
      </motion.div>
    </motion.div>
  );
}

function ShapEmphasis({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const [open, setOpen] = useState(false);
  const tipId = "shap-tip";
  return (
    <>
      {!prefersReducedMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl"
          initial={{ boxShadow: "0 0 0 0 rgba(245,158,11,0)" }}
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(245,158,11,0)",
              "0 0 0 10px rgba(245,158,11,0.15)",
              "0 0 0 0 rgba(245,158,11,0)",
            ],
          }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
      <button
        type="button"
        aria-label="Explainability help"
        aria-describedby={open ? tipId : undefined}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[10px] font-bold text-white/90 backdrop-blur"
      >
        ?
      </button>
      <motion.div
        role="tooltip"
        id={tipId}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: open ? 1 : 0, y: open ? 0 : -6 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute right-2 top-9 z-10 w-44 rounded-md border border-white/20 bg-black/80 p-2 text-[11px] text-white/90 shadow-lg"
      >
        Feature attributions (SHAP-like) explain each score.
      </motion.div>
    </>
  );
}
