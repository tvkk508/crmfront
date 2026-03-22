import type { TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "../../cn";
import { controlDisabled, controlFocus } from "./controlStyles";

type TextareaSize = "small" | "medium" | "large";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  size?: TextareaSize;
  error?: boolean;
};

const sizeClass: Record<TextareaSize, string> = {
  small: "min-h-[4.5rem] px-ui-2 py-ui-2 text-ui-caption",
  medium: "min-h-[6rem] px-ui-3 py-ui-2 text-ui-body",
  large: "min-h-[8rem] px-ui-4 py-ui-3 text-ui-body-lg",
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size = "medium", error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full min-w-0 resize-y rounded-ui-md border border-ui-border bg-ui-surface text-ui-text",
        "placeholder:text-ui-text-muted",
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
    />
  )
);

Textarea.displayName = "Textarea";
