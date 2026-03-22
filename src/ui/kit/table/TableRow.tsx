import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "../../cn";

export type TableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  /** Highlight row (e.g. selection) */
  selected?: boolean;
};

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b border-ui-border transition-colors duration-ui-fast",
        "hover:bg-ui-surface-muted/70",
        selected && "bg-ui-accent/8",
        className
      )}
      {...props}
    />
  )
);

TableRow.displayName = "TableRow";
