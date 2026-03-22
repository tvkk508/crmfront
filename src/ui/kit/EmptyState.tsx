/**
 * Canonical empty state — semantic type scale and spacing.
 *
 * Phase 1 Update: Enhanced with new design tokens for better visual hierarchy.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

export type EmptyStateSize = "small" | "medium" | "large";

export type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
  size?: EmptyStateSize;
  /** Use subtle background instead of bordered */
  variant?: "bordered" | "subtle" | "ghost";
};

const sizeClasses: Record<EmptyStateSize, string> = {
  small: "py-ui-6 px-ui-4",
  medium: "py-ui-8 px-ui-6",
  large: "py-ui-12 px-ui-8",
};

const iconSizeClasses: Record<EmptyStateSize, string> = {
  small: "[&_svg]:h-8 [&_svg]:w-8",
  medium: "[&_svg]:h-10 [&_svg]:w-10",
  large: "[&_svg]:h-12 [&_svg]:w-12",
};

export function EmptyState({
  className,
  title,
  description,
  icon,
  children,
  size = "medium",
  variant = "bordered",
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "rounded-ui-xl",
        sizeClasses[size],
        
        // Variant styles
        variant === "bordered" && [
          "border border-dashed border-ui-border",
          "bg-ui-surface-subtle",
        ],
        variant === "subtle" && [
          "bg-ui-surface-muted",
        ],
        variant === "ghost" && [
          "bg-transparent",
        ],
        
        className
      )}
      {...props}
    >
      {icon && (
        <div 
          className={cn(
            "mb-ui-4 text-ui-text-tertiary",
            iconSizeClasses[size]
          )}
        >
          {icon}
        </div>
      )}
      
      <h3 
        className={cn(
          "text-balance font-semibold text-ui-text",
          size === "small" && "text-ui-subheading",
          size === "medium" && "text-ui-section-title",
          size === "large" && "text-ui-page-title",
        )}
      >
        {title}
      </h3>
      
      {description && (
        <p 
          className={cn(
            "mt-ui-2 max-w-ui-readable text-balance text-ui-text-muted",
            size === "small" && "text-ui-caption",
            size === "medium" && "text-ui-body",
            size === "large" && "text-ui-body-lg",
          )}
        >
          {description}
        </p>
      )}
      
      {children && (
        <div className="mt-ui-4 w-full min-w-0 flex flex-col items-center gap-ui-2">
          {children}
        </div>
      )}
    </div>
  );
}

/** Compact inline empty state for lists/tables */
export type EmptyStateInlineProps = HTMLAttributes<HTMLDivElement> & {
  message: string;
  icon?: ReactNode;
};

export function EmptyStateInline({
  className,
  message,
  icon,
  ...props
}: EmptyStateInlineProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-ui-2",
        "py-ui-4 px-ui-3",
        "text-ui-caption text-ui-text-muted",
        className
      )}
      {...props}
    >
      {icon && (
        <span className="[&_svg]:h-4 [&_svg]:w-4 text-ui-text-tertiary">
          {icon}
        </span>
      )}
      <span>{message}</span>
    </div>
  );
}
