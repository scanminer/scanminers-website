import { Sparkles, Layers, BarChart3, Leaf } from "lucide-react";

type HeroVisualProps = {
  variant?: "full" | "compact";
};

export function HeroVisual({ variant = "full" }: HeroVisualProps) {
  const commodities = ["Li", "Co", "Ni", "REE", "Cu", "Graphite"];
  const features = [
    { icon: Layers, label: "Multi-sensor fusion" },
    { icon: BarChart3, label: "Explainable AI (SHAP)" },
    { icon: Leaf, label: "SDG-aligned exploration" },
    { icon: Sparkles, label: "Critical mineral targeting" },
  ];

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border/50 ${variant === "full" ? "min-h-[400px] lg:min-h-[500px]" : "min-h-[300px]"}`}>
      {/* Satellite/Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Simulated satellite imagery pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="0.5"/>
              </pattern>
              <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(14, 165, 233, 0.15)" />
                <stop offset="100%" stopColor="rgba(14, 165, 233, 0)" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <circle cx="30%" cy="40%" r="120" fill="url(#glow)" />
            <circle cx="70%" cy="60%" r="150" fill="url(#glow)" />
          </svg>
        </div>
        
        {/* Topographic contours simulation */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-sky-400"
              style={{
                left: `${20 + i * 8}%`,
                top: `${30 + i * 5}%`,
                width: `${100 + i * 40}px`,
                height: `${100 + i * 40}px`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Gradient Overlay using brand colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-emerald-600/20" />
      
      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-6 lg:p-8">
        {/* Top: Commodity chips */}
        <div className="flex flex-wrap gap-2">
          {commodities.map((commodity) => (
            <div
              key={commodity}
              className="rounded-full border border-sky-400/50 bg-sky-950/80 px-3 py-1 text-xs font-semibold text-sky-200 backdrop-blur-sm"
            >
              {commodity}
            </div>
          ))}
        </div>

        {/* Bottom: Feature chips */}
        <div className={`grid gap-3 ${variant === "full" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2"}`}>
          {features.slice(0, variant === "full" ? 4 : 2).map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-950/60 px-3 py-2 backdrop-blur-sm"
            >
              <Icon className="h-4 w-4 text-emerald-300" />
              <span className="text-xs font-medium text-emerald-100">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative data points */}
      <div className="absolute right-8 top-8 h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
      <div className="absolute right-16 top-24 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: "0.5s" }} />
      <div className="absolute right-12 top-40 h-2 w-2 rounded-full bg-sky-400 animate-pulse" style={{ animationDelay: "1s" }} />
    </div>
  );
}
