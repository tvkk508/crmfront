import type { TableHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "../../cn";

export type TableProps = TableHTMLAttributes<HTMLTableElement>;

/** Semantic `<table>` — add `min-w-[…]` when horizontal scroll is required on narrow viewports. */
export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <table
      ref={ref}
      className={cn(
        "w-full min-w-0 border-collapse text-left text-ui-body text-ui-text",
        className
      )}
      {...props}
    />
  )
);

Table.displayName = "Table";
