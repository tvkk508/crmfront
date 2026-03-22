/**
 * Select — native select with consistent styling.
 *
 * Phase 1 Update: Enhanced with new design tokens for better interactive states.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import type { SelectHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "../../cn";
import { controlBase, controlDisabled, controlError, controlFocus, controlHover, controlSizes } from "./controlStyles";

type SelectSize = "small" | "medium" | "large";

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  size?: SelectSize;
  error?: boolean;
};

const sizeClass: Record<SelectSize, string> = {
  small: `${controlSizes.small} pl-ui-2.5 pr-ui-8`,
  medium: `${controlSizes.medium} pl-ui-3 pr-10`,
  large: `${controlSizes.large} pl-ui-3.5 pr-11`,
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, size = "medium", error, children, ...props }, ref) => (
    <div className="relative min-w-0">
      <select
        ref={ref}
        className={cn(
          controlBase,
          "cursor-pointer appearance-none",
          controlFocus,
          controlDisabled,
          sizeClass[size],
          error ? controlError : controlHover,
          className
        )}
        {...props}
      >
        {children}
      </select>
      {/* Chevron icon */}
      <span
        className={cn(
          "pointer-events-none absolute right-ui-3 top-1/2 -translate-y-1/2",
          "text-ui-text-muted",
          "transition-colors duration-ui-fast",
        )}
        aria-hidden
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  )
);

Select.displayName = "Select";
