import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "../../cn";

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "role"> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-ui-full border border-ui-border transition-colors duration-ui-fast",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-ui-background",
        checked
          ? "border-button-primary bg-button-primary"
          : "bg-ui-surface-muted",
        disabled && "cursor-not-allowed opacity-ui-disabled",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none absolute left-0.5 top-1/2 block h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-ui-elevation transition-transform duration-ui-fast",
          checked ? "translate-x-5" : "translate-x-0"
        )}
        aria-hidden
      />
    </button>
  )
);

Switch.displayName = "Switch";
