import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../cn";

export type FieldHintProps = HTMLAttributes<HTMLParagraphElement> & {
  children?: ReactNode;
};

export function FieldHint({ className, children, ...props }: FieldHintProps) {
  return (
    <p
      className={cn("text-ui-caption text-ui-text-muted", className)}
      {...props}
    >
      {children}
    </p>
  );
}
