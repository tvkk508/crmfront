import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef, useId } from "react";
import { cn } from "../../cn";
import { controlFocus } from "./controlStyles";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  label?: ReactNode;
  description?: ReactNode;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, id, label, description, disabled, ...props }, ref) => {
    const uid = useId();
    const inputId = id ?? uid;

    return (
      <div className="flex min-w-0 gap-ui-2">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          disabled={disabled}
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 rounded-ui-sm border-ui-border accent-button-primary",
            "disabled:cursor-not-allowed disabled:opacity-ui-disabled",
            controlFocus,
            className
          )}
          {...props}
        />
        {label != null ? (
          <div className="min-w-0 flex-1">
            <label
              htmlFor={inputId}
              className={cn(
                "text-ui-body text-ui-text",
                disabled && "text-ui-text-muted"
              )}
            >
              {label}
            </label>
            {description ? (
              <p className="mt-ui-1 text-ui-caption text-ui-text-muted">{description}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
