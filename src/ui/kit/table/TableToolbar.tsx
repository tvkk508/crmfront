import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../../cn";

export type TableToolbarProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

/** Strip above the scroll region: filters, actions (not inside `<table>`). */
export const TableToolbar = forwardRef<HTMLDivElement, TableToolbarProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="toolbar"
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-ui-2 sm:gap-ui-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

TableToolbar.displayName = "TableToolbar";
