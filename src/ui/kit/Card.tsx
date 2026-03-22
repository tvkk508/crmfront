/**
 * Canonical surface card — semantic radius, border, shadows.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  variant?: "default" | "outlined" | "elevated";
};

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-ui-lg bg-ui-surface text-ui-text",
        "transition-[box-shadow,border-color] duration-ui-fast",
        variant === "default" && "border border-ui-border shadow-ui-elevation",
        variant === "outlined" && "border border-ui-border shadow-none",
        variant === "elevated" && "border border-ui-border shadow-ui-overlay",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
