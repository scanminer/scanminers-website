"use client";

import { useState } from "react";

interface Mineral {
  name: string;
  symbol: string;
  category: "battery" | "tech" | "strategic";
  applications: string[];
}

const minerals: Mineral[] = [
  {
    name: "Lithium",
    symbol: "Li",
    category: "battery",
    applications: ["EV batteries", "Energy storage", "Grid stabilization"],
  },
  {
    name: "Cobalt",
    symbol: "Co",
    category: "battery",
    applications: ["Battery cathodes", "Superalloys", "Magnets"],
  },
  {
    name: "Nickel",
    symbol: "Ni",
    category: "battery",
    applications: ["Battery chemistry", "Stainless steel", "Alloys"],
  },
  {
    name: "Copper",
    symbol: "Cu",
    category: "tech",
    applications: ["EV wiring", "Renewable energy", "Infrastructure"],
  },
  {
    name: "Rare Earths",
    symbol: "REE",
    category: "tech",
    applications: ["Wind turbines", "EV motors", "Electronics"],
  },
  {
    name: "Graphite",
    symbol: "C",
    category: "battery",
    applications: ["Battery anodes", "Steel production", "Lubricants"],
  },
  {
    name: "Manganese",
    symbol: "Mn",
    category: "battery",
    applications: ["Battery cathodes", "Steel alloys", "Aluminum alloys"],
  },
  {
    name: "Bauxite",
    symbol: "Al₂O₃",
    category: "strategic",
    applications: ["Aluminum production", "Lightweight transport", "Construction"],
  },
];

export function MineralsGrid() {
  const [selectedMineral, setSelectedMineral] = useState<Mineral | null>(null);
  const [hoveredMineral, setHoveredMineral] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {minerals.map((mineral) => {
          const isSelected = selectedMineral?.name === mineral.name;
          const isHovered = hoveredMineral === mineral.name;
          const categoryColors = {
            battery: "from-primary/20 to-primary/5 border-primary/30",
            tech: "from-secondary/20 to-secondary/5 border-secondary/30",
            strategic: "from-accent/20 to-accent/5 border-accent/30",
          };

          return (
            <button
              key={mineral.name}
              onClick={() =>
                setSelectedMineral(isSelected ? null : mineral)
              }
              onMouseEnter={() => setHoveredMineral(mineral.name)}
              onMouseLeave={() => setHoveredMineral(null)}
              className={`
                group relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br p-6 shadow-lg transition-all duration-300
                ${categoryColors[mineral.category]}
                ${
                  isSelected
                    ? "scale-105 shadow-2xl ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "hover:scale-105 hover:shadow-xl"
                }
              `}
            >
              {/* Symbol */}
              <div className="text-4xl font-bold text-fg transition-transform group-hover:scale-110">
                {mineral.symbol}
              </div>

              {/* Name */}
              <div className="mt-2 text-sm font-semibold text-fg/80">
                {mineral.name}
              </div>

              {/* Hover/Selected Indicator */}
              {(isHovered || isSelected) && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              )}

              {/* Category Badge */}
              <div
                className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md ${
                  mineral.category === "battery"
                    ? "bg-primary"
                    : mineral.category === "tech"
                    ? "bg-secondary"
                    : "bg-accent"
                }`}
              >
                {mineral.category}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Panel */}
      {selectedMineral && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="text-5xl font-bold text-fg">
                  {selectedMineral.symbol}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-fg">
                    {selectedMineral.name}
                  </h3>
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md ${
                      selectedMineral.category === "battery"
                        ? "bg-gradient-to-r from-primary to-accent"
                        : selectedMineral.category === "tech"
                        ? "bg-gradient-to-r from-secondary to-earth"
                        : "bg-gradient-to-r from-accent to-primary"
                    }`}
                  >
                    {selectedMineral.category}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-bold text-fg">Key Applications:</p>
                <ul className="mt-2 space-y-2">
                  {selectedMineral.applications.map((app) => (
                    <li
                      key={app}
                      className="flex items-start gap-2 text-sm text-fg/70"
                    >
                      <svg
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-success"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {app}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              onClick={() => setSelectedMineral(null)}
              className="rounded-full p-2 text-fg/50 transition-colors hover:bg-fg/10 hover:text-fg"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary"></div>
          <span className="font-semibold text-fg/70">Battery Metals</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-secondary"></div>
          <span className="font-semibold text-fg/70">Technology Metals</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-accent"></div>
          <span className="font-semibold text-fg/70">Strategic Minerals</span>
        </div>
      </div>
    </div>
  );
}
