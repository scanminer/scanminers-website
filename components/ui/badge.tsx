import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-150",
  {
    variants: {
      variant: {
        default:
          "bg-[rgb(var(--sm-surface-elevated))] text-[rgb(var(--sm-text))] border border-[rgba(var(--sm-border-subtle)/0.35)]",
        primary:
          "bg-[rgb(var(--sm-primary)/0.1)] text-[rgb(var(--sm-primary))] border border-[rgb(var(--sm-primary)/0.2)]",
        accent:
          "bg-[rgb(var(--sm-accent)/0.1)] text-[rgb(var(--sm-accent))] border border-[rgb(var(--sm-accent)/0.2)]",
        mineral:
          "bg-[rgb(var(--gold)/0.1)] text-[rgb(var(--gold))] border border-[rgb(var(--gold)/0.3)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      className={twMerge(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}
