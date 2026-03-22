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
};

const densityPadding: Record<"default" | "compact", string> = {
  default: "px-ui-3 py-ui-3 align-middle",
  compact: "px-ui-2 py-ui-2 align-middle",
};

const overflowClass: Record<TableCellOverflow, string> = {
  truncate: "min-w-0 max-w-full truncate",
  wrap: "min-w-0 break-words [overflow-wrap:anywhere]",
  numeric: "whitespace-nowrap tabular-nums",
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
          "text-ui-caption sm:text-ui-body",
          densityPadding[density],
          overflowClass[overflow],
          as === "th" && "text-left font-semibold text-text-primary",
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
