import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../cn";
import { ScrollArea, type ScrollAreaProps } from "../ScrollArea";
import type { TableDensity } from "./TableContext";
import { TableDensityProvider } from "./TableContext";

export type DataTableProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  density?: TableDensity;
};

/**
 * Density context + vertical flex column for toolbar + scroll viewport.
 * Compose: `<DataTable><TableToolbar/><DataTableScrollArea><Table>…</Table></DataTableScrollArea></DataTable>`
 */
export function DataTable({ children, className, density = "default", ...props }: DataTableProps) {
  return (
    <TableDensityProvider value={density}>
      <div
        className={cn("flex min-h-0 min-w-0 flex-1 flex-col gap-ui-3", className)}
        {...props}
      >
        {children}
      </div>
    </TableDensityProvider>
  );
}

/** Canonical scroll region around `<Table>` — horizontal scroll when table is wider than viewport. */
export function DataTableScrollArea({ className, ...props }: ScrollAreaProps) {
  return (
    <ScrollArea
      orientation="both"
      className={cn(
        "min-h-0 min-w-0 flex-1 overscroll-contain rounded-ui-md border border-ui-border bg-ui-surface",
        className
      )}
      {...props}
    />
  );
}
