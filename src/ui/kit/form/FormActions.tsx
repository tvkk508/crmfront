import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../cn";

export type FormActionsProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  align?: "start" | "end" | "between";
  /** `plain` removes top border / extra padding (e.g. inline in a toolbar). */
  variant?: "default" | "plain";
};

export function FormActions({
  className,
  children,
  align = "end",
  variant = "default",
  ...props
}: FormActionsProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-ui-2",
        variant === "default" && "mt-ui-4 border-t border-ui-border pt-ui-4",
        align === "end" && "justify-end",
        align === "start" && "justify-start",
        align === "between" && "justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
