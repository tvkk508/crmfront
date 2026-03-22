/**
 * Canonical button — semantic tokens (`ui-*`), aligned heights with `--control-height`.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 * Source: references/platform-develop/packages/ui/src/components/ModernButton.svelte
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../cn";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "negative" | "positive";
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
    "min-h-[calc(var(--control-height)-4px)] h-[calc(var(--control-height)-4px)] px-ui-2 gap-ui-1 rounded-ui-sm text-ui-caption font-medium",
  medium:
    "min-h-[var(--control-height)] h-[var(--control-height)] px-ui-3 gap-ui-2 rounded-ui-md text-ui-body font-medium",
  large: "min-h-10 h-10 px-ui-4 gap-ui-2 rounded-ui-md text-ui-body-lg font-medium",
};

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-ui-background";

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
          "inline-flex shrink-0 items-center justify-center border border-transparent whitespace-nowrap",
          "transition-colors duration-ui-fast ease-out",
          "active:brightness-[0.97]",
          focusRing,
          sizeClasses[size],
          variant === "primary" &&
            "bg-button-primary text-white shadow-ui-elevation hover:bg-button-primary-hover active:bg-button-primary-pressed disabled:active:brightness-100",
          variant === "secondary" &&
            "border border-button-secondary bg-button-secondary text-text-primary hover:bg-button-secondary-hover active:bg-[rgb(var(--secondary-button-pressed))] disabled:active:brightness-100",
          variant === "tertiary" &&
            "bg-transparent text-text-primary hover:bg-[var(--ui-overlay-hover)] active:bg-[var(--ui-overlay-active)] shadow-none disabled:active:brightness-100",
          variant === "negative" &&
            "bg-button-negative text-white hover:bg-button-negative-hover active:bg-[rgb(var(--negative-button-pressed))] disabled:active:brightness-100",
          variant === "positive" &&
            "bg-button-positive text-white hover:bg-button-positive-hover active:bg-button-positive-pressed disabled:active:brightness-100",
          isDisabled && "cursor-not-allowed opacity-ui-disabled",
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
};

const iconSizeClasses: Record<ButtonSize, string> = {
  small:
    "min-h-[calc(var(--control-height)-4px)] min-w-[calc(var(--control-height)-4px)] rounded-ui-sm text-ui-caption",
  medium: "min-h-[var(--control-height)] min-w-[var(--control-height)] rounded-ui-md text-ui-body",
  large: "min-h-10 min-w-10 rounded-ui-md text-ui-body-lg",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "tertiary", size = "medium", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex items-center justify-center border transition-colors duration-ui-fast ease-out",
          "active:brightness-[0.97]",
          focusRing,
          iconSizeClasses[size],
          variant === "primary" &&
            "border-transparent bg-button-primary text-white shadow-ui-elevation hover:bg-button-primary-hover active:bg-button-primary-pressed",
          variant === "secondary" &&
            "border border-button-secondary bg-button-secondary text-text-primary hover:bg-button-secondary-hover active:bg-[rgb(var(--secondary-button-pressed))]",
          variant === "tertiary" &&
            "border-transparent bg-transparent text-text-primary hover:bg-[var(--ui-overlay-hover)] active:bg-[var(--ui-overlay-active)]",
          variant === "negative" &&
            "border-transparent bg-button-negative text-white hover:bg-button-negative-hover active:bg-[rgb(var(--negative-button-pressed))]",
          variant === "positive" &&
            "border-transparent bg-button-positive text-white hover:bg-button-positive-hover active:bg-button-positive-pressed",
          "disabled:cursor-not-allowed disabled:opacity-ui-disabled disabled:active:brightness-100",
          className
        )}
        {...props}
      />
    );
  }
);

IconButton.displayName = "IconButton";
