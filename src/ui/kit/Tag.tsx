/**
 * Canonical tag (pill) — semantic borders and fills.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

export type TagProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "neutral";
  size?: "small" | "medium";
};

export function Tag({
  className,
  variant = "default",
  size = "medium",
  children,
  ...props
}: TagProps) {
  const v = variant === "default" ? "primary" : variant;

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center justify-center rounded-ui-full border font-semibold whitespace-nowrap",
        "transition-colors duration-ui-fast",
        size === "medium" && "min-h-5 px-ui-2 text-[10px] leading-tight",
        size === "small" && "min-h-4 px-1.5 text-[9px] leading-tight",
        v === "primary" &&
          "border-ui-accent/25 bg-ui-accent/10 text-button-primary",
        v === "success" &&
          "border-ui-success/25 bg-ui-success/10 text-state-positive",
        v === "warning" && "border-ui-warn/25 bg-ui-warn/10 text-ui-warn",
        v === "danger" &&
          "border-ui-danger/25 bg-ui-danger/10 text-state-negative",
        v === "neutral" &&
          "border-ui-border bg-ui-surface-muted text-text-tertiary",
        className
      )}
      {...props}
    >
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}
