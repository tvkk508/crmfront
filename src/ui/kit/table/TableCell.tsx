/**
 * TableCell — consistent cell styling with overflow protection.
 *
 * Phase 1 Update: Enhanced with new spacing tokens and typography.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "../../cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";
import { useTableDensity } from "./TableContext";

export type TableCellOverflow = "truncate" | "wrap" | "numeric";

export type TableCellProps = HTMLAttributes<HTMLTableCellElement> & {
  as?: "td" | "th";
  /** For `as="th"` (column / row headers). */
  scope?: "col" | "row" | "colgroup" | "rowgroup";
  overflow?: TableCellOverflow;
  /** Native tooltip when `overflow="truncate"` and no `tooltipContent`. */
  title?: string;
  /** Radix tooltip for full text (use with long labels). */
  tooltipContent?: string;
  /** Align content */
  align?: "left" | "center" | "right";
};

const densityPadding: Record<"default" | "compact", string> = {
  default: "px-table-cell-x py-table-cell-y",
  compact: "px-ui-2 py-ui-2",
};

const overflowClass: Record<TableCellOverflow, string> = {
  truncate: "min-w-0 max-w-full truncate",
  wrap: "min-w-0 break-words [overflow-wrap:anywhere]",
  numeric: "whitespace-nowrap tabular-nums slashed-zero",
};

const alignClass: Record<"left" | "center" | "right", string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  (
    {
      className,
      as = "td",
      overflow = "truncate",
      title,
      tooltipContent,
      children,
      scope,
      align = "left",
      ...props
    },
    ref
  ) => {
    const density = useTableDensity();
    const Comp = as;
    const showTooltip =
      overflow === "truncate" &&
      typeof tooltipContent === "string" &&
      tooltipContent.length > 0;

    const cell = (
      <Comp
        ref={ref}
        scope={as === "th" ? (scope ?? "col") : undefined}
        className={cn(
          "align-middle",
          "text-ui-body-sm",
          densityPadding[density],
          overflowClass[overflow],
          alignClass[align],
          
          // Header cell styles
          as === "th" && [
            "font-medium text-ui-text-secondary",
            "bg-ui-surface-subtle",
            "border-b border-ui-border-muted",
          ],
          
          // Data cell styles
          as === "td" && [
            "text-ui-text",
            "border-b border-ui-border-muted",
          ],
          
          className
        )}
        title={overflow === "truncate" && !showTooltip ? title : undefined}
        {...props}
      >
        {children}
      </Comp>
    );

    if (!showTooltip) {
      return cell;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{cell}</TooltipTrigger>
        <TooltipContent className="max-w-[min(24rem,calc(100vw-1.5rem))] break-words">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    );
  }
);

TableCell.displayName = "TableCell";
