"use client";

import { useScrollProgress } from "@/lib/scroll-animations";

export function ScrollProgressBar() {
  const progress = useScrollProgress();

  return (
    <div className="fixed left-0 right-0 top-0 z-50 h-1">
      <div
        className="h-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
