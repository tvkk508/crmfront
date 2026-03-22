/**
 * Canonical badge — soft semantic tones (aligned with legacy `tone=*` look).
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

export type BadgeVariant =
  | "neutral"
  | "accent"
  | "success"
  | "warn"
  | "danger"
  /** @deprecated use `success` — kept for deal widgets / pipeline mappers */
  | "positive"
  /** @deprecated use `danger` — kept for deal widgets / pipeline mappers */
  | "negative";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
  variant?: BadgeVariant;
  badgeSize?: "small" | "medium";
};

export function Badge({
  className,
  variant = "neutral",
  badgeSize = "medium",
  children,
  ...props
}: BadgeProps) {
  const v =
    variant === "positive"
      ? "success"
      : variant === "negative"
        ? "danger"
        : variant;

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center justify-center font-medium tabular-nums",
        "rounded-ui-sm border border-transparent",
        badgeSize === "medium" && "min-h-6 px-ui-2 text-ui-caption leading-none",
        badgeSize === "small" && "min-h-[22px] px-1.5 text-[10px] leading-none",
        v === "neutral" && "bg-ui-surface-muted text-ui-text-muted",
        v === "accent" && "bg-ui-accent/12 text-ui-accent",
        v === "success" && "bg-ui-success/12 text-ui-success",
        v === "warn" && "bg-ui-warn/12 text-ui-warn",
        v === "danger" && "bg-ui-danger/12 text-ui-danger",
        className
      )}
      {...props}
    >
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}
