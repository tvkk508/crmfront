/**
 * Legacy Input — thin wrapper over canonical `ui/kit/Input` (default size `medium`).
 * `SearchInput` uses the same semantic chrome as kit inputs.
 */
import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";
import { Input as KitInput, type InputProps as KitInputProps } from "./kit/Input";
import { cn } from "./cn";

export type InputProps = KitInputProps;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size = "medium", ...props }, ref) => <KitInput ref={ref} size={size} {...props} />
);

Input.displayName = "Input";

type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  wrapperClassName?: string;
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, wrapperClassName, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex h-[var(--control-height)] w-full min-w-0 items-center gap-ui-2 rounded-ui-md border border-ui-border bg-ui-surface px-ui-2",
          "transition-colors duration-ui-fast focus-within:border-ui-accent/50 focus-within:ring-2 focus-within:ring-ui-focus-ring/20",
          wrapperClassName
        )}
      >
        <svg
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-ui-text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          ref={ref}
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent text-ui-body text-ui-text placeholder:text-ui-text-muted",
            "focus-visible:outline-none",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
