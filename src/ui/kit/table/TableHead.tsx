import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "../../cn";

export type TableHeadProps = HTMLAttributes<HTMLTableSectionElement>;

export const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(
        "sticky top-0 z-20 bg-ui-surface",
        "[&_tr]:border-b [&_tr]:border-ui-border",
        "shadow-[0_1px_0_0_rgb(var(--ui-color-border))]",
        className
      )}
      {...props}
    />
  )
);

TableHead.displayName = "TableHead";
