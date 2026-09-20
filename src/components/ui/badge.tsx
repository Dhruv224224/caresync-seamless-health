import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-danger-muted/30 bg-danger-soft text-danger-muted dark:bg-danger-soft/30 dark:text-destructive dark:border-danger-muted/40",
        outline: "text-ink border-border bg-card/80",
        completed:
          "border-teal-primary/30 bg-teal-light text-teal-dark dark:bg-teal-primary/20 dark:text-calm dark:border-teal-primary/40",
        pending:
          "border-amber-muted/30 bg-amber-soft text-amber-muted dark:bg-amber-muted/20 dark:text-warn dark:border-amber-muted/40",
        urgent:
          "border-danger-muted/30 bg-danger-soft text-danger-muted dark:bg-danger-soft/30 dark:text-destructive dark:border-danger-muted/40",
        ai: "border-indigo-ai/30 bg-indigo-soft text-indigo-ai dark:bg-indigo-ai/20 dark:text-semantic-ai dark:border-indigo-ai/40",
        info: "border-blue-accent/30 bg-blue-soft text-blue-hover dark:bg-blue-soft/20 dark:text-blue-accent dark:border-blue-accent/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
