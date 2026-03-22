import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../cn";

export type FormFieldProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

/** Vertical stack: label → control → hint / error (`gap-ui-1`). */
export function FormField({ className, children, ...props }: FormFieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-ui-1", className)} {...props}>
      {children}
    </div>
  );
}
