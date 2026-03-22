import type { ReactNode } from "react";
import { cn } from "../../cn";

export type TableEmptyStateProps = {
  colSpan: number;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

/**
 * Single `<tr>` — place inside `<TableBody>` when there are no data rows.
 */
export function TableEmptyState({
  colSpan,
  title,
  description,
  children,
  className,
}: TableEmptyStateProps) {
  return (
    <tr className="border-0 hover:bg-transparent">
      <td
        colSpan={colSpan}
        className={cn(
          "p-ui-8 text-center align-middle sm:p-ui-10",
          className
        )}
      >
        <div className="text-ui-section-title text-text-primary">{title}</div>
        {description ? (
          <div className="mt-ui-2 text-ui-body text-ui-text-muted">{description}</div>
        ) : null}
        {children ? <div className="mt-ui-4 flex justify-center">{children}</div> : null}
      </td>
    </tr>
  );
}
