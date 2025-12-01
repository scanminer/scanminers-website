import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-secondary text-secondary-fg shadow-md hover:bg-secondary/90 hover:shadow-lg",
        primary:
          "bg-secondary text-secondary-fg shadow-md hover:bg-secondary/90 hover:shadow-lg",
        secondary:
          "bg-primary text-primary-fg shadow-md hover:bg-primary/90 hover:shadow-lg",
        outline:
          "border-2 border-border bg-background text-fg hover:border-primary hover:bg-card",
        ghost: "hover:bg-fg/5 text-fg",
        link: "text-primary underline-offset-4 hover:underline",
        // Scanminers signature variants
        "sm-primary":
          "bg-[rgb(var(--sm-primary))] text-slate-950 shadow-lg hover:shadow-xl hover:-translate-y-[1px] focus-visible:ring-2 focus-visible:ring-[rgb(var(--sm-primary)/0.5)]",
        "sm-secondary":
          "bg-[rgb(var(--sm-surface-elevated))] text-[rgb(var(--sm-text))] border-2 border-[rgba(var(--sm-border-strong)/0.65)] hover:border-[rgb(var(--sm-primary))] hover:bg-[rgb(var(--sm-surface))] shadow-lg hover:shadow-xl hover:-translate-y-[1px]",
        "sm-ghost":
          "text-[rgb(var(--sm-text))] hover:bg-[rgb(var(--sm-surface)/0.5)]",
      },
      size: {
        default: "h-10 px-6 py-3",
        sm: "h-8 px-4 py-2",
        lg: "h-12 px-8 py-3",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={twMerge(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
