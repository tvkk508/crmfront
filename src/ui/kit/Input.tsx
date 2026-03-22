/**
 * Canonical text input — consistent heights, semantic focus ring, premium feel.
 *
 * Phase 1 Update: Enhanced with new design tokens for better focus states,
 * improved border colors, and consistent sizing.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../cn";

type InputSize = "small" | "medium" | "large";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  size?: InputSize;
  error?: boolean;
  /** Left icon or element */
  leftElement?: ReactNode;
  /** Right icon or element */
  rightElement?: ReactNode;
};

const inputSizeClasses: Record<InputSize, string> = {
  small:
    "h-ui-input-sm min-h-ui-input-sm px-ui-2.5 text-ui-body-sm",
  medium: 
    "h-ui-input-md min-h-ui-input-md px-ui-3 text-ui-body",
  large: 
    "h-ui-input-lg min-h-ui-input-lg px-ui-3.5 text-ui-body-lg",
};

const focusInput =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus-ring/35 focus-visible:ring-offset-0 focus-visible:border-ui-accent";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = "medium", error, leftElement, rightElement, ...props }, ref) => {
    // If there are elements, render with wrapper
    if (leftElement || rightElement) {
      return (
        <div className="relative w-full">
          {leftElement && (
            <div className="absolute left-0 top-0 bottom-0 flex items-center pl-ui-3 text-ui-text-muted pointer-events-none">
              {leftElement}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              // Base styles
              "w-full min-w-0 rounded-ui-input",
              "border border-ui-border bg-ui-surface text-ui-text",
              "placeholder:text-ui-text-tertiary",
              "transition-all duration-ui-fast ease-ui-ease",
              focusInput,
              inputSizeClasses[size],
              
              // Adjust padding for elements
              leftElement && "pl-9",
              rightElement && "pr-9",
              
              // Hover state
              !error && "hover:border-ui-border-strong hover:bg-ui-surface",
              
              // Error state
              error && [
                "border-ui-danger",
                "focus-visible:border-ui-danger focus-visible:ring-ui-danger/25",
              ],
              
              // Disabled state
              "disabled:cursor-not-allowed disabled:bg-ui-surface-muted",
              "disabled:text-ui-text-tertiary disabled:opacity-ui-disabled",
              "disabled:border-ui-border-muted",
              
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-0 top-0 bottom-0 flex items-center pr-ui-3 text-ui-text-muted">
              {rightElement}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={cn(
          // Base styles
          "w-full min-w-0 rounded-ui-input",
          "border border-ui-border bg-ui-surface text-ui-text",
          "placeholder:text-ui-text-tertiary",
          "transition-all duration-ui-fast ease-ui-ease",
          focusInput,
          inputSizeClasses[size],
          
          // Hover state
          !error && "hover:border-ui-border-strong hover:bg-ui-surface",
          
          // Error state
          error && [
            "border-ui-danger",
            "focus-visible:border-ui-danger focus-visible:ring-ui-danger/25",
          ],
          
          // Disabled state
          "disabled:cursor-not-allowed disabled:bg-ui-surface-muted",
          "disabled:text-ui-text-tertiary disabled:opacity-ui-disabled",
          "disabled:border-ui-border-muted",
          
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

/** Textarea variant with same styling */
export type TextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> & {
  size?: InputSize;
  error?: boolean;
};

const textareaSizeClasses: Record<InputSize, string> = {
  small: "px-ui-2.5 py-ui-1.5 text-ui-body-sm min-h-[60px]",
  medium: "px-ui-3 py-ui-2 text-ui-body min-h-[80px]",
  large: "px-ui-3.5 py-ui-2.5 text-ui-body-lg min-h-[100px]",
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size = "medium", error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          // Base styles
          "w-full min-w-0 rounded-ui-input resize-y",
          "border border-ui-border bg-ui-surface text-ui-text",
          "placeholder:text-ui-text-tertiary",
          "transition-all duration-ui-fast ease-ui-ease",
          "leading-relaxed",
          focusInput,
          textareaSizeClasses[size],
          
          // Hover state
          !error && "hover:border-ui-border-strong hover:bg-ui-surface",
          
          // Error state
          error && [
            "border-ui-danger",
            "focus-visible:border-ui-danger focus-visible:ring-ui-danger/25",
          ],
          
          // Disabled state
          "disabled:cursor-not-allowed disabled:bg-ui-surface-muted",
          "disabled:text-ui-text-tertiary disabled:opacity-ui-disabled disabled:resize-none",
          "disabled:border-ui-border-muted",
          
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

/** Form field wrapper with label and error message */
export type FormFieldProps = {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-form-field-gap", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-ui-body-sm font-medium text-ui-text"
        >
          {label}
          {required && <span className="text-ui-danger ml-0.5">*</span>}
        </label>
      )}
      {children}
      {(error || hint) && (
        <p
          className={cn(
            "text-ui-caption",
            error ? "text-ui-danger" : "text-ui-text-muted"
          )}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}
