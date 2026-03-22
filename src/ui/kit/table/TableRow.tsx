/**
 * TableRow — consistent row styling with interactive states.
 *
 * Phase 1 Update: Enhanced with new surface tokens for better hover/selected states.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "../../cn";

export type TableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  /** Highlight row (e.g. selection) */
  selected?: boolean;
  /** Make row clickable/interactive */
  interactive?: boolean;
  /** Striped row (for zebra striping) */
  striped?: boolean;
};

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected, interactive, striped, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "transition-colors duration-ui-fast ease-ui-ease",
        
        // Default state
        "bg-ui-surface",
        
        // Striped styling (when used with nth-child in parent)
        striped && "even:bg-ui-surface-subtle",
        
        // Hover state
        "hover:bg-ui-surface-hover",
        
        // Selected state
        selected && [
          "bg-ui-surface-selected",
          "hover:bg-ui-surface-selected",
        ],
        
        // Interactive (clickable) row
        interactive && [
          "cursor-pointer",
          "active:bg-ui-surface-active",
        ],
        
        className
      )}
      {...props}
    />
  )
);

TableRow.displayName = "TableRow";

/** Table row header variant (used in <thead>) */
export const TableHeaderRow = forwardRef<
  HTMLTableRowElement,
  HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "bg-ui-surface-subtle",
      "border-b border-ui-border",
      className
    )}
    {...props}
  />
));

TableHeaderRow.displayName = "TableHeaderRow";
