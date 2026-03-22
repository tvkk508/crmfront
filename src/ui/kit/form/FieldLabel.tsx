import type { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "../../cn";

export type FieldLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children?: ReactNode;
  required?: boolean;
};

export function FieldLabel({
  className,
  children,
  required,
  ...props
}: FieldLabelProps) {
  return (
    <label
      className={cn(
        "min-w-0 text-ui-caption font-medium text-text-primary",
        required &&
          "after:ml-0.5 after:text-ui-danger after:content-['*']",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}
