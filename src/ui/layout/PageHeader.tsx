import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

export type PageHeaderProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

/**
 * Top block for title row + actions — not sticky by default (parent overflow may clip sticky).
 * Pass `className` with `sticky top-0 z-10` when the scroll container is a child below this header.
 */
export function PageHeader({ className, children, ...props }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 shrink-0 flex-col gap-ui-2 border-b border-ui-border pb-ui-4",
        "sm:flex-row sm:items-start sm:justify-between sm:gap-ui-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
