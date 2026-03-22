import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../cn";

export type FieldErrorProps = HTMLAttributes<HTMLParagraphElement> & {
  children?: ReactNode;
};

export function FieldError({ className, children, id, ...props }: FieldErrorProps) {
  if (children == null || children === false) {
    return null;
  }
  return (
    <p
      id={id}
      role="alert"
      className={cn("text-ui-caption text-ui-danger", className)}
      {...props}
    >
      {children}
    </p>
  );
}
