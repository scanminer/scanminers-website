"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProspectData {
  region: string;
  mineral: string;
  signal: string;
  drivers: string;
  depth: string;
  risk: string;
}

const prospects: ProspectData[] = [
  {
    region: "Central Nevada",
    mineral: "Copper ± Gold (Porphyry)",
    signal: "0.73 (Moderate)",
    drivers: "Magnetic high, DEM break, nearby prospects",
    depth: "200–500 m under cover",
    risk: "Drilling recommended after detailed ground follow-up",
  },
  {
    region: "Northern Chile",
    mineral: "Lithium Brine",
    signal: "0.81 (High)",
    drivers: "Salars, structural lineaments, elevation profile",
    depth: "Surface to 300 m",
    risk: "High confidence; fast-track to resource model",
  },
  {
    region: "Western Australia",
    mineral: "Nickel Sulfide",
    signal: "0.68 (Moderate)",
    drivers: "Ultramafic contact, gravity anomaly, historic mines",
    depth: "150–400 m depth",
    risk: "Additional airborne EM required before drilling",
  },
];

interface ConsoleLineProps {
  label: string;
  value: string;
  delay: number;
}

function ConsoleLine({ label, value, delay }: ConsoleLineProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-all duration-300 ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
      }`}
    >
      <div className="flex items-start gap-2 text-sm">
        <span className="text-[rgb(var(--sm-text-muted))] font-mono min-w-[100px]">
          {label}:
        </span>
        <span className="text-[rgb(var(--sm-text))] flex-1">{value}</span>
      </div>
    </div>
  );
}

export function AIInsightConsole() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % prospects.length);
      setKey((prev) => prev + 1);
    }, 8000); // Rotate every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const prospect = prospects[currentIndex];

  return (
    <Card variant="elevated" padding="lg" className="relative overflow-hidden">
      {/* Subtle scan line effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgb(var(--sm-primary)/0.2)] to-transparent animate-pulse" />
      </div>

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[rgba(var(--sm-border-subtle)/0.35)]">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[rgb(var(--sm-primary))] animate-pulse" />
              <h3 className="text-lg font-semibold text-[rgb(var(--sm-text))]">
                AI Prospect Analysis
              </h3>
            </div>
            <p className="text-sm text-[rgb(var(--sm-text-muted))] font-mono">
              {prospect.region}
            </p>
          </div>
          <Badge variant="mineral">{prospect.mineral}</Badge>
        </div>

        {/* Console output - animated lines */}
        <div key={key} className="space-y-3 font-mono">
          <ConsoleLine
            label="Signal strength"
            value={prospect.signal}
            delay={200}
          />
          <ConsoleLine label="Drivers" value={prospect.drivers} delay={400} />
          <ConsoleLine label="Depth" value={prospect.depth} delay={600} />
          <ConsoleLine label="Risk" value={prospect.risk} delay={800} />
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-2 pt-4">
          {prospects.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-8 bg-[rgb(var(--sm-primary))]"
                  : "w-1.5 bg-[rgba(var(--sm-border-subtle)/0.35)]"
              }`}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
