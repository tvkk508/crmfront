/**
 * Canonical loading placeholder — semantic surface, no layout-affecting animation beyond opacity.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import type { HTMLAttributes } from "react";
import { cn } from "../cn";

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "text" | "circular" | "rectangular";
};

export function Skeleton({
  className,
  variant = "rectangular",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-ui-border/20",
        variant === "circular" && "rounded-ui-full",
        variant === "text" && "rounded-ui-sm",
        variant === "rectangular" && "rounded-ui-md",
        className
      )}
      {...props}
    />
  );
}
