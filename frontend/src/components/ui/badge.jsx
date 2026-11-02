import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-white",
        secondary: "bg-secondary text-white",
        destructive: "bg-error-container text-on-error-container font-bold",
        outline: "text-on-surface border border-outline/30",
        surface: "bg-surface-container text-on-surface",
        success: "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold",
        warning: "bg-amber-100 text-amber-900 border border-amber-300 font-bold",
        tertiary: "bg-tertiary-container/30 text-on-tertiary-container font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

