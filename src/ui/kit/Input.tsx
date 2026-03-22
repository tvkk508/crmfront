/**
 * Canonical text input — `--control-height` scale, semantic focus ring.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "../cn";

type InputSize = "small" | "medium" | "large";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  size?: InputSize;
  error?: boolean;
};

const inputSizeClasses: Record<InputSize, string> = {
  small:
    "min-h-[calc(var(--control-height)-4px)] h-[calc(var(--control-height)-4px)] px-ui-2 text-ui-caption",
  medium: "min-h-[var(--control-height)] h-[var(--control-height)] px-ui-3 text-ui-body",
  large: "min-h-10 h-10 px-ui-4 text-ui-body-lg",
};

const focusInput =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus-ring/30 focus-visible:ring-offset-0";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = "medium", error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full min-w-0 rounded-ui-md border border-ui-border bg-ui-surface text-ui-text",
          "placeholder:text-ui-text-muted",
          "transition-colors duration-ui-fast",
          "disabled:cursor-not-allowed disabled:bg-ui-surface-muted disabled:text-ui-text-muted disabled:opacity-ui-disabled",
          focusInput,
          inputSizeClasses[size],
          error
            ? "border-ui-danger focus-visible:border-ui-danger focus-visible:ring-ui-danger/30"
            : "hover:border-ui-border/80",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
