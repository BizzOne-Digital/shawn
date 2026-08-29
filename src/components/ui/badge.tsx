import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-buffalo-red focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-navy text-white hover:bg-navy-light",
        secondary:
          "border-transparent bg-soft-gray text-navy hover:bg-soft-gray-dark",
        destructive:
          "border-transparent bg-buffalo-red text-white hover:bg-buffalo-red-light",
        outline: "border-border text-foreground",
        accent:
          "border-transparent bg-buffalo-red/10 text-buffalo-red-dark",
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

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
