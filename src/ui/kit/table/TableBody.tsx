import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "../../cn";

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>;

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
);

TableBody.displayName = "TableBody";
