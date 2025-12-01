import Image from "next/image";
import type { ImageProps } from "next/image";

interface FramedImageProps extends Omit<ImageProps, "className"> {
  caption?: string;
  variant?: "default" | "elevated";
  className?: string;
}

export function FramedImage({
  caption,
  variant = "default",
  className = "",
  alt,
  ...props
}: FramedImageProps) {
  const variantStyles = {
    default: "border-[rgba(var(--sm-border-subtle)/0.35)] shadow-lg",
    elevated:
      "border-[rgba(var(--sm-border-strong)/0.65)] shadow-[0_0_40px_rgba(34,211,238,0.20)]",
  };

  return (
    <figure className={`space-y-3 ${className}`}>
      <div
        className={`relative overflow-hidden rounded-2xl border ${variantStyles[variant]} transition-all duration-200`}
      >
        <Image alt={alt} {...props} className="w-full h-auto" />
      </div>
      {caption && (
        <figcaption className="text-sm text-[rgb(var(--sm-text-muted))] text-center px-4">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// Placeholder component for when real images aren't available yet
interface PlaceholderImageProps {
  aspectRatio?: "video" | "square" | "wide";
  label: string;
  caption?: string;
  variant?: "default" | "elevated";
}

export function PlaceholderImage({
  aspectRatio = "video",
  label,
  caption,
  variant = "default",
}: PlaceholderImageProps) {
  const aspectStyles = {
    video: "aspect-video",
    square: "aspect-square",
    wide: "aspect-[21/9]",
  };

  const variantStyles = {
    default: "border-[rgba(var(--sm-border-subtle)/0.35)] shadow-lg",
    elevated:
      "border-[rgba(var(--sm-border-strong)/0.65)] shadow-[0_0_40px_rgba(34,211,238,0.20)]",
  };

  return (
    <figure className="space-y-3">
      <div
        className={`relative overflow-hidden rounded-2xl border ${variantStyles[variant]} ${aspectStyles[aspectRatio]} bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center`}
      >
        {/* Noise texture effect */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative z-10 text-center space-y-2 px-6">
          <div className="text-[rgb(var(--sm-text-muted))] text-sm font-mono">
            {label}
          </div>
          <div className="text-[rgb(var(--sm-text-subtle))] text-xs">
            TODO: Add real image
          </div>
        </div>
      </div>
      {caption && (
        <figcaption className="text-sm text-[rgb(var(--sm-text-muted))] text-center px-4">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
