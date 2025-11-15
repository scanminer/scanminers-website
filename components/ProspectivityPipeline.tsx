import { Database, GitMerge, BrainCircuit, TrendingUp, Target } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Database,
    title: "Ingest",
    description: "Multi-sensor and geological inputs: satellite, hyperspectral, DEM, geochem",
    color: "sky",
  },
  {
    number: 2,
    icon: GitMerge,
    title: "Fuse",
    description: "Data fusion and feature engineering across sensor types",
    color: "violet",
  },
  {
    number: 3,
    icon: BrainCircuit,
    title: "Model",
    description: "Explainable AI: XGBoost, Random Forest, SHAP interpretability",
    color: "amber",
  },
  {
    number: 4,
    icon: TrendingUp,
    title: "Rank",
    description: "Prospectivity scores and ranked target identification",
    color: "emerald",
  },
  {
    number: 5,
    icon: Target,
    title: "Decide",
    description: "Drill targeting, field programs, SDG-aligned decisions",
    color: "rose",
  },
] as const;

const colorClasses = {
  sky: {
    bg: "bg-sky-50 dark:bg-sky-950/30",
    border: "border-sky-200 dark:border-sky-800",
    icon: "text-sky-600 dark:text-sky-400",
    number: "bg-sky-600 dark:bg-sky-500",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800",
    icon: "text-violet-600 dark:text-violet-400",
    number: "bg-violet-600 dark:bg-violet-500",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    icon: "text-amber-600 dark:text-amber-400",
    number: "bg-amber-600 dark:bg-amber-500",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: "text-emerald-600 dark:text-emerald-400",
    number: "bg-emerald-600 dark:bg-emerald-500",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800",
    icon: "text-rose-600 dark:text-rose-400",
    number: "bg-rose-600 dark:bg-rose-500",
  },
};

export function ProspectivityPipeline() {
  return (
    <div className="space-y-8">
      {/* Desktop: Horizontal layout */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-5 gap-4">
          {steps.map((step, index) => {
            const colors = colorClasses[step.color];
            const Icon = step.icon;
            
            return (
              <div key={step.number} className="relative">
                <div className={`flex h-full flex-col rounded-xl border ${colors.border} ${colors.bg} p-6 shadow-sm`}>
                  {/* Number badge */}
                  <div className={`mb-4 flex h-8 w-8 items-center justify-center rounded-full ${colors.number} text-sm font-bold text-white`}>
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <Icon className={`mb-3 h-8 w-8 ${colors.icon}`} />
                  
                  {/* Title */}
                  <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                  
                  {/* Description */}
                  <p className="text-sm text-foreground/70 dark:text-foreground/60">{step.description}</p>
                </div>
                
                {/* Arrow connector */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-2 top-1/2 z-10 -translate-y-1/2 translate-x-full">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-border">
                      <path d="M1 8h14m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile/Tablet: Vertical layout */}
      <div className="lg:hidden space-y-4">
        {steps.map((step, index) => {
          const colors = colorClasses[step.color];
          const Icon = step.icon;
          
          return (
            <div key={step.number} className="relative">
              <div className={`flex items-start gap-4 rounded-xl border ${colors.border} ${colors.bg} p-5 shadow-sm`}>
                {/* Number badge */}
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${colors.number} text-sm font-bold text-white`}>
                  {step.number}
                </div>
                
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className={`h-6 w-6 ${colors.icon}`} />
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-sm text-foreground/70 dark:text-foreground/60">{step.description}</p>
                </div>
              </div>
              
              {/* Arrow connector */}
              {index < steps.length - 1 && (
                <div className="ml-5 flex justify-center py-2">
                  <svg width="16" height="24" viewBox="0 0 16 24" fill="none" className="text-border">
                    <path d="M8 1v22m0 0-4-4m4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
