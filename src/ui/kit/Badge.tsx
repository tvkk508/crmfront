/**
 * Canonical badge — soft semantic tones with improved visual hierarchy.
 *
 * Phase 1 Update: Enhanced with new design tokens, better color contrast,
 * and consistent sizing tokens.
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
  | "info"
  /** @deprecated use `success` — kept for deal widgets / pipeline mappers */
  | "positive"
  /** @deprecated use `danger` — kept for deal widgets / pipeline mappers */
  | "negative";

export type BadgeSize = "small" | "medium" | "large";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
  variant?: BadgeVariant;
  badgeSize?: BadgeSize;
  /** Show as a dot/indicator style without text */
  dot?: boolean;
};

export function Badge({
  className,
  variant = "neutral",
  badgeSize = "medium",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  // Map deprecated variants
  const v =
    variant === "positive"
      ? "success"
      : variant === "negative"
        ? "danger"
        : variant;

  // Dot indicator mode
  if (dot) {
    return (
      <span
        className={cn(
          "inline-block rounded-full",
          badgeSize === "small" && "h-1.5 w-1.5",
          badgeSize === "medium" && "h-2 w-2",
          badgeSize === "large" && "h-2.5 w-2.5",
          v === "neutral" && "bg-ui-text-tertiary",
          v === "accent" && "bg-ui-accent",
          v === "success" && "bg-ui-success",
          v === "warn" && "bg-ui-warn",
          v === "danger" && "bg-ui-danger",
          v === "info" && "bg-ui-info",
          className
        )}
        {...props}
      />
    );
  }

  return (
    <span
      className={cn(
        // Base styles
        "inline-flex max-w-full items-center justify-center",
        "rounded-ui-badge font-ui-button",
        "tabular-nums select-none",
        "border",
        
        // Size variants
        badgeSize === "small" && [
          "h-ui-badge-sm min-h-ui-badge-sm",
          "px-ui-1.5 text-[10px] leading-none",
        ],
        badgeSize === "medium" && [
          "h-ui-badge-md min-h-ui-badge-md",
          "px-ui-2 text-ui-caption leading-none",
        ],
        badgeSize === "large" && [
          "min-h-6 h-6",
          "px-ui-2.5 text-ui-body-sm leading-none",
        ],
        
        // Color variants - improved contrast and backgrounds
        v === "neutral" && [
          "bg-ui-surface-muted text-ui-text-secondary",
          "border-ui-border-muted",
        ],
        v === "accent" && [
          "bg-ui-accent-subtle text-ui-accent",
          "border-ui-accent/15",
        ],
        v === "success" && [
          "bg-ui-success-muted text-ui-success",
          "border-ui-success/15",
        ],
        v === "warn" && [
          "bg-ui-warn-muted text-amber-700",
          "border-ui-warn/20",
        ],
        v === "danger" && [
          "bg-ui-danger-muted text-ui-danger",
          "border-ui-danger/15",
        ],
        v === "info" && [
          "bg-ui-info-muted text-ui-info",
          "border-ui-info/15",
        ],
        
        className
      )}
      {...props}
    >
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}

/** Status indicator badge with optional label */
export type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  status: "active" | "pending" | "completed" | "failed" | "draft" | "archived";
  showLabel?: boolean;
};

const statusConfig = {
  active: { variant: "success" as const, label: "Active" },
  pending: { variant: "warn" as const, label: "Pending" },
  completed: { variant: "accent" as const, label: "Completed" },
  failed: { variant: "danger" as const, label: "Failed" },
  draft: { variant: "neutral" as const, label: "Draft" },
  archived: { variant: "neutral" as const, label: "Archived" },
};

export function StatusBadge({
  status,
  showLabel = true,
  className,
  ...props
}: StatusBadgeProps) {
  const config = statusConfig[status];

  if (!showLabel) {
    return (
      <Badge
        variant={config.variant}
        dot
        className={className}
        aria-label={config.label}
        {...props}
      />
    );
  }

  return (
    <Badge
      variant={config.variant}
      badgeSize="small"
      className={className}
      {...props}
    >
      {config.label}
    </Badge>
  );
}
