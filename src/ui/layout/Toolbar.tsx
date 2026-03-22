import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

export type ToolbarProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export function Toolbar({ className, children, ...props }: ToolbarProps) {
  return (
    <div
      role="toolbar"
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-ui-2 sm:gap-ui-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
