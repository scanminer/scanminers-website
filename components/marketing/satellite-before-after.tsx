"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";

interface SatelliteBeforeAfterProps {
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function SatelliteBeforeAfter({
  beforeImage = "/images/maps/bauxite-slider-fusion.png",
  afterImage = "/images/maps/bauxite-slider-raw.png",
  beforeLabel = "Raw multi-sensor inputs",
  afterLabel = "Scanminers fusion prospectivity map",
}: SatelliteBeforeAfterProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleMove(e.clientX);
    },
    [handleMove]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX);
    },
    [handleMove]
  );

  // Handle drag events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <Card variant="elevated" padding="none" className="overflow-hidden">
      <div
        ref={containerRef}
        className="relative w-full aspect-[16/9] select-none cursor-col-resize"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* Before image (full) */}
        <div className="absolute inset-0">
          <Image
            src={beforeImage}
            alt="Raw multi-sensor satellite-style view of the bauxite study area showing terrain and lineaments"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        </div>

        {/* After image (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <Image
            src={afterImage}
            alt="Scanminers fusion prospectivity map for bauxite showing high-potential zones, lineaments and mines"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        </div>

        {/* Slider handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-[rgb(var(--sm-primary))] shadow-[0_0_40px_rgba(34,211,238,0.20)]"
          style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
        >
          {/* Handle circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[rgb(var(--sm-surface-elevated))] border-2 border-[rgb(var(--sm-primary))] shadow-[0_0_40px_rgba(34,211,238,0.20)] flex items-center justify-center">
            <svg
              className="w-6 h-6 text-[rgb(var(--sm-primary))]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
              />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-sm-surface-elevated/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-sm-border-subtle">
          <span className="text-xs font-semibold text-sm-text">
            {beforeLabel}
          </span>
        </div>
        <div className="absolute top-4 right-4 bg-sm-surface-elevated/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-sm-border-subtle">
          <span className="text-xs font-semibold text-sm-text">
            {afterLabel}
          </span>
        </div>
      </div>
    </Card>
  );
}
