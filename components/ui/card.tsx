import * as React from "react";
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva("rounded-2xl border transition-all duration-200", {
  variants: {
    variant: {
      default:
        "bg-[rgb(var(--sm-surface))] border-[rgba(var(--sm-border-subtle)/0.35)] shadow-lg hover:border-[rgba(var(--sm-border-strong)/0.65)] hover:-translate-y-[2px]",
      elevated:
        "bg-[rgb(var(--sm-surface-elevated))] border-[rgba(var(--sm-border-strong)/0.65)] shadow-lg shadow-[0_0_40px_rgba(34,211,238,0.20)]",
      ghost: "bg-transparent border-transparent",
    },
    padding: {
      default: "p-6",
      sm: "p-4",
      lg: "p-8",
      none: "p-0",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "default",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(cardVariants({ variant, padding }), className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";
