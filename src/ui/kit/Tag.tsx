/**
 * Canonical tag (pill) — semantic borders and fills.
 *
 * Phase 1 Update: Enhanced with new design tokens for better visual hierarchy.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

export type TagVariant = "default" | "primary" | "success" | "warning" | "danger" | "neutral" | "info";
export type TagSize = "small" | "medium" | "large";

export type TagProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
  variant?: TagVariant;
  size?: TagSize;
  /** Remove icon (onClick shows close button behavior) */
  removable?: boolean;
  onRemove?: () => void;
};

export function Tag({
  className,
  variant = "default",
  size = "medium",
  removable,
  onRemove,
  children,
  ...props
}: TagProps) {
  const v = variant === "default" ? "primary" : variant;

  return (
    <span
      className={cn(
        // Base styles
        "inline-flex max-w-full items-center justify-center",
        "rounded-ui-full border",
        "font-semibold whitespace-nowrap select-none",
        "transition-colors duration-ui-fast ease-ui-ease",
        
        // Size variants
        size === "small" && "min-h-4 h-4 px-ui-1.5 text-[9px] leading-tight gap-0.5",
        size === "medium" && "min-h-5 h-5 px-ui-2 text-[10px] leading-tight gap-1",
        size === "large" && "min-h-6 h-6 px-ui-2.5 text-ui-caption leading-tight gap-1.5",
        
        // Color variants
        v === "primary" && [
          "border-ui-accent/20 bg-ui-accent-subtle text-ui-accent",
        ],
        v === "success" && [
          "border-ui-success/20 bg-ui-success-muted text-ui-success",
        ],
        v === "warning" && [
          "border-ui-warn/20 bg-ui-warn-muted text-amber-700",
        ],
        v === "danger" && [
          "border-ui-danger/20 bg-ui-danger-muted text-ui-danger",
        ],
        v === "neutral" && [
          "border-ui-border-muted bg-ui-surface-muted text-ui-text-muted",
        ],
        v === "info" && [
          "border-ui-info/20 bg-ui-info-muted text-ui-info",
        ],
        
        className
      )}
      {...props}
    >
      <span className="min-w-0 truncate">{children}</span>
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn(
            "inline-flex items-center justify-center",
            "rounded-full -mr-0.5",
            "opacity-60 hover:opacity-100",
            "transition-opacity duration-ui-fast",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current",
            size === "small" && "h-3 w-3",
            size === "medium" && "h-3.5 w-3.5",
            size === "large" && "h-4 w-4",
          )}
          aria-label="Remove"
        >
          <svg
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={cn(
              size === "small" && "h-2 w-2",
              size === "medium" && "h-2.5 w-2.5",
              size === "large" && "h-3 w-3",
            )}
          >
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </button>
      )}
    </span>
  );
}

/** Tag group for multiple tags */
export type TagGroupProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export function TagGroup({ className, children, ...props }: TagGroupProps) {
  return (
    <div 
      className={cn("flex flex-wrap gap-ui-1", className)} 
      {...props}
    >
      {children}
    </div>
  );
}
