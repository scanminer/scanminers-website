import { MapPin, Lightbulb, ListOrdered } from "lucide-react";

const productViews = [
  {
    icon: MapPin,
    title: "Regional Prospectivity Map",
    description: "Heatmap visualization with contours showing high-potential areas and ranked targets across your area of interest.",
    bullets: [
      "Color-coded prospectivity scores",
      "Interactive hotspot identification",
      "Contextual geological overlays",
    ],
    imagePath: "/images/screens/prospectivity-map.png",
    imageAlt: "Prospectivity heatmap showing mineral potential",
  },
  {
    icon: Lightbulb,
    title: "Explainability View",
    description: "SHAP-powered feature importance charts reveal why specific targets rank high—no black box.",
    bullets: [
      "Feature importance rankings",
      "Per-target SHAP values",
      "Transparent AI decision-making",
    ],
    imagePath: "/images/screens/explainability-view.png",
    imageAlt: "SHAP feature importance visualization",
  },
  {
    icon: ListOrdered,
    title: "Ranked Target List",
    description: "Sortable, filterable list of exploration targets with scores, coordinates, and key metadata.",
    bullets: [
      "Prospectivity scores (0-100)",
      "Confidence intervals",
      "Export to field programs",
    ],
    imagePath: "/images/screens/target-list.png",
    imageAlt: "Ranked list of exploration targets",
  },
];

export function ProductScreensStrip() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {productViews.map((view) => {
        const Icon = view.icon;
        
        return (
          <div
            key={view.title}
            className="group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card/60 shadow-lg transition-all hover:shadow-xl hover:border-border"
          >
            {/* Screenshot placeholder */}
            <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
              {/* Placeholder pattern - will be replaced with actual screenshots */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <Icon className="h-16 w-16 text-slate-400 dark:text-slate-600" />
                  <div className="absolute inset-0 animate-pulse rounded-lg bg-gradient-to-br from-sky-500/20 to-emerald-500/20" />
                </div>
              </div>
              
              {/* Grid overlay for tech feel */}
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id={`grid-${view.title}`} width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#grid-${view.title})`} />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {view.title}
                </h3>
              </div>

              <p className="mb-4 text-sm text-muted-foreground">
                {view.description}
              </p>

              <ul className="mt-auto space-y-2">
                {view.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="mt-0.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
