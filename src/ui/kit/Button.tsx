/**
 * Canonical button — semantic tokens (`ui-*`), aligned heights with component visual contracts.
 *
 * Phase 1 Update: Enhanced with new design token system for consistent interactive states,
 * improved shadows, and better visual hierarchy.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 * Source: references/platform-develop/packages/ui/src/components/ModernButton.svelte
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../cn";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost" | "negative" | "positive";
export type ButtonSize = "small" | "medium" | "large";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children?: ReactNode;
};

const sizeClasses: Record<ButtonSize, string> = {
  small:
    "h-ui-button-sm min-h-ui-button-sm px-ui-2.5 gap-ui-1 text-ui-caption font-ui-button",
  medium:
    "h-ui-button-md min-h-ui-button-md px-ui-3.5 gap-ui-2 text-ui-body-sm font-ui-button",
  large: 
    "h-ui-button-lg min-h-ui-button-lg px-ui-4 gap-ui-2 text-ui-body font-ui-button",
};

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ui-background";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild,
      className,
      variant = "primary",
      size = "medium",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    return (
      <Comp
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex shrink-0 items-center justify-center",
          "whitespace-nowrap select-none",
          "rounded-ui-button border border-transparent",
          "transition-all duration-ui-fast ease-ui-ease",
          focusRing,
          sizeClasses[size],
          
          // Primary variant - solid accent button
          variant === "primary" && [
            "bg-ui-accent text-ui-text-inverse",
            "shadow-ui-sm",
            "hover:bg-ui-accent-hover hover:shadow-ui-elevation",
            "active:bg-[rgb(var(--primary-button-pressed))] active:shadow-ui-xs active:scale-[0.98]",
          ],
          
          // Secondary variant - subtle accent background
          variant === "secondary" && [
            "bg-ui-accent-subtle text-ui-accent",
            "border-ui-accent/10",
            "hover:bg-ui-accent-muted hover:border-ui-accent/15",
            "active:bg-[rgb(var(--secondary-button-pressed))] active:scale-[0.98]",
          ],
          
          // Tertiary variant - outlined
          variant === "tertiary" && [
            "bg-ui-surface text-ui-text",
            "border-ui-border shadow-ui-xs",
            "hover:bg-ui-surface-hover hover:border-ui-border-strong",
            "active:bg-ui-surface-active active:scale-[0.98]",
          ],
          
          // Ghost variant - transparent
          variant === "ghost" && [
            "bg-transparent text-ui-text-secondary",
            "hover:bg-ui-surface-hover hover:text-ui-text",
            "active:bg-ui-surface-active active:scale-[0.98]",
          ],
          
          // Negative/danger variant
          variant === "negative" && [
            "bg-ui-danger text-ui-text-inverse",
            "shadow-ui-sm",
            "hover:bg-[rgb(var(--negative-button-hovered))] hover:shadow-ui-elevation",
            "active:bg-[rgb(var(--negative-button-pressed))] active:shadow-ui-xs active:scale-[0.98]",
          ],
          
          // Positive/success variant
          variant === "positive" && [
            "bg-ui-success text-ui-text-inverse",
            "shadow-ui-sm",
            "hover:bg-[rgb(var(--positive-button-hovered))] hover:shadow-ui-elevation",
            "active:bg-[rgb(var(--positive-button-pressed))] active:shadow-ui-xs active:scale-[0.98]",
          ],
          
          // Disabled & loading states
          isDisabled && "cursor-not-allowed opacity-ui-disabled pointer-events-none",
          loading && "cursor-wait",
          className
        )}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center justify-center" aria-hidden>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  "aria-label": string;
};

const iconSizeClasses: Record<ButtonSize, string> = {
  small:
    "h-ui-button-sm w-ui-button-sm min-h-ui-button-sm min-w-ui-button-sm",
  medium: 
    "h-ui-button-md w-ui-button-md min-h-ui-button-md min-w-ui-button-md",
  large: 
    "h-ui-button-lg w-ui-button-lg min-h-ui-button-lg min-w-ui-button-lg",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "ghost", size = "medium", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          // Base styles
          "inline-flex items-center justify-center",
          "rounded-ui-button border border-transparent",
          "transition-all duration-ui-fast ease-ui-ease",
          focusRing,
          iconSizeClasses[size],
          
          // Primary variant
          variant === "primary" && [
            "bg-ui-accent text-ui-text-inverse shadow-ui-sm",
            "hover:bg-ui-accent-hover hover:shadow-ui-elevation",
            "active:bg-[rgb(var(--primary-button-pressed))] active:scale-[0.95]",
          ],
          
          // Secondary variant
          variant === "secondary" && [
            "bg-ui-accent-subtle text-ui-accent border-ui-accent/10",
            "hover:bg-ui-accent-muted hover:border-ui-accent/15",
            "active:bg-[rgb(var(--secondary-button-pressed))] active:scale-[0.95]",
          ],
          
          // Tertiary variant
          variant === "tertiary" && [
            "bg-ui-surface text-ui-text-secondary border-ui-border shadow-ui-xs",
            "hover:bg-ui-surface-hover hover:text-ui-text hover:border-ui-border-strong",
            "active:bg-ui-surface-active active:scale-[0.95]",
          ],
          
          // Ghost variant (default for icon buttons)
          variant === "ghost" && [
            "bg-transparent text-ui-text-secondary",
            "hover:bg-ui-surface-hover hover:text-ui-text",
            "active:bg-ui-surface-active active:scale-[0.95]",
          ],
          
          // Negative variant
          variant === "negative" && [
            "bg-ui-danger text-ui-text-inverse shadow-ui-sm",
            "hover:bg-[rgb(var(--negative-button-hovered))] hover:shadow-ui-elevation",
            "active:bg-[rgb(var(--negative-button-pressed))] active:scale-[0.95]",
          ],
          
          // Positive variant
          variant === "positive" && [
            "bg-ui-success text-ui-text-inverse shadow-ui-sm",
            "hover:bg-[rgb(var(--positive-button-hovered))] hover:shadow-ui-elevation",
            "active:bg-[rgb(var(--positive-button-pressed))] active:scale-[0.95]",
          ],
          
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-ui-disabled disabled:pointer-events-none",
          className
        )}
        {...props}
      />
    );
  }
);

IconButton.displayName = "IconButton";
