import type { SelectHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "../../cn";
import { controlDisabled, controlFocus } from "./controlStyles";

type SelectSize = "small" | "medium" | "large";

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  size?: SelectSize;
  error?: boolean;
};

const sizeClass: Record<SelectSize, string> = {
  small:
    "min-h-[calc(var(--control-height)-4px)] h-[calc(var(--control-height)-4px)] pl-ui-2 pr-ui-8 text-ui-caption",
  medium: "min-h-[var(--control-height)] h-[var(--control-height)] pl-ui-3 pr-10 text-ui-body",
  large: "min-h-10 h-10 pl-ui-4 pr-11 text-ui-body-lg",
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, size = "medium", error, children, ...props }, ref) => (
    <div className="relative min-w-0">
      <select
        ref={ref}
        className={cn(
          "w-full min-w-0 cursor-pointer appearance-none rounded-ui-md border border-ui-border bg-ui-surface text-ui-text",
          "transition-colors duration-ui-fast",
          controlFocus,
          controlDisabled,
          sizeClass[size],
          error
            ? "border-ui-danger focus-visible:border-ui-danger focus-visible:ring-ui-danger/30"
            : "hover:border-ui-border/80",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <span
        className="pointer-events-none absolute right-ui-2 top-1/2 block h-0 w-0 -translate-y-1/2 border-x-[4px] border-t-[5px] border-x-transparent border-t-ui-text-muted"
        aria-hidden
      />
    </div>
  )
);

Select.displayName = "Select";
