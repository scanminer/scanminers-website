"use client";

import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

type Stage = {
  label: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  tooltip: string;
};

// Animated diagram showing multi-sensor fusion flow (Phase 2)
export function MultiSensorFusionDiagram() {
  const prefersReducedMotion = useReducedMotion();

  const stages: Stage[] = [
    {
      label: "ASTER",
      bgColor: "bg-rose-500/30",
      borderColor: "border-rose-400/60",
      textColor: "text-rose-200",
      tooltip: "Thermal & VNIR imagery for mineral detection",
    },
    {
      label: "Landsat",
      bgColor: "bg-amber-500/30",
      borderColor: "border-amber-400/60",
      textColor: "text-amber-200",
      tooltip: "30m multispectral for broad coverage",
    },
    {
      label: "Sentinel",
      bgColor: "bg-orange-500/30",
      borderColor: "border-orange-400/60",
      textColor: "text-orange-200",
      tooltip: "10m optical + SAR for texture analysis",
    },
    {
      label: "PRISMA",
      bgColor: "bg-purple-500/30",
      borderColor: "border-purple-400/60",
      textColor: "text-purple-200",
      tooltip: "Hyperspectral (240 bands) for mineral ID",
    },
    {
      label: "Fusion",
      bgColor: "bg-emerald-500/40",
      borderColor: "border-emerald-400/70",
      textColor: "text-emerald-200",
      tooltip: "Multi-source data integration layer",
    },
    {
      label: "XGBoost",
      bgColor: "bg-cyan-500/30",
      borderColor: "border-cyan-400/60",
      textColor: "text-cyan-200",
      tooltip: "Gradient boosting for prospectivity modeling",
    },
    {
      label: "SHAP",
      bgColor: "bg-yellow-500/35",
      borderColor: "border-yellow-400/70",
      textColor: "text-yellow-200",
      tooltip: "Feature attributions explain each prediction",
    },
    {
      label: "Targets",
      bgColor: "bg-teal-500/40",
      borderColor: "border-teal-400/70",
      textColor: "text-teal-100",
      tooltip: "Ranked drill targets with confidence scores",
    },
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
        visible: {
          y: 0,
          opacity: 1,
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        },
      };

  return (
    <motion.div
      className="rounded-2xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
        Multi-sensor fusion
      </p>
      <motion.div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stages.map((s, i) => (
          <StageCard
            key={s.label}
            stage={s}
            index={i}
            fusionIdx={fusionIdx}
            shapIdx={shapIdx}
            targetsIdx={targetsIdx}
            totalStages={stages.length}
            prefersReducedMotion={!!prefersReducedMotion}
            itemVariants={item}
          />
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

function StageCard({
  stage,
  index,
  fusionIdx,
  shapIdx,
  targetsIdx,
  totalStages,
  prefersReducedMotion,
  itemVariants,
}: {
  stage: Stage;
  index: number;
  fusionIdx: number;
  shapIdx: number;
  targetsIdx: number;
  totalStages: number;
  prefersReducedMotion: boolean;
  itemVariants: Variants;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.02 }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`group relative overflow-hidden rounded-xl border-2 ${stage.borderColor} ${stage.bgColor} p-3 cursor-default transition-shadow hover:shadow-lg hover:shadow-white/5`}
    >
      <div className={`text-sm font-semibold ${stage.textColor}`}>{stage.label}</div>

      {/* Tooltip */}
      <motion.div
        role="tooltip"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: showTooltip ? 1 : 0, y: showTooltip ? 0 : 4 }}
        transition={{ duration: 0.15 }}
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-48 -translate-x-1/2 rounded-lg border border-white/20 bg-slate-900/95 px-3 py-2 text-[11px] text-white/90 shadow-xl backdrop-blur"
      >
        <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-white/20 bg-slate-900/95" />
        {stage.tooltip}
      </motion.div>

      {/* Fusion shimmer */}
      {index === fusionIdx && !prefersReducedMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background:
              "linear-gradient(120deg, transparent 30%, rgba(16,185,129,0.35) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
          }}
          initial={{ backgroundPositionX: "0%", opacity: 0.0 }}
          whileInView={{ backgroundPositionX: ["0%", "200%"], opacity: 1 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
      )}

      {/* SHAP pulsing glow */}
      {index === shapIdx && !prefersReducedMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl"
          initial={{ boxShadow: "0 0 0 0 rgba(234,179,8,0)" }}
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(234,179,8,0)",
              "0 0 0 8px rgba(234,179,8,0.2)",
              "0 0 0 0 rgba(234,179,8,0)",
            ],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            repeatDelay: 1.2,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      )}

      {/* Targets badge */}
      {index === targetsIdx && (
        <motion.span
          className="absolute bottom-2 right-2 rounded-md bg-teal-600/50 px-1.5 py-0.5 text-[10px] font-medium text-teal-100"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, transition: { delay: 0.4 } }}
        >
          ranked targets
        </motion.span>
      )}

      {/* Connecting line between rows */}
      {index < totalStages - 1 && index % 4 === 3 && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-3 left-1/2 hidden h-3 w-0.5 -translate-x-1/2 bg-white/30 sm:block"
          initial={prefersReducedMotion ? { height: 12 } : { height: 0 }}
          whileInView={prefersReducedMotion ? undefined : { height: 12 }}
          transition={{ delay: 0.2 + index * 0.06, duration: 0.4 }}
        />
      )}
    </motion.div>
  );
}
