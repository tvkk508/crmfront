/**
 * Canonical empty state — semantic type scale and spacing.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

export type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
};

export function EmptyState({
  className,
  title,
  description,
  icon,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-ui-lg border border-dashed border-ui-border bg-ui-surface",
        "p-ui-6 text-center md:p-ui-8",
        className
      )}
      {...props}
    >
      {icon ? (
        <div className="mb-ui-4 text-ui-text-muted [&_svg]:h-10 [&_svg]:w-10">{icon}</div>
      ) : null}
      <div className="text-ui-section-title text-balance">{title}</div>
      {description ? (
        <div className="mt-ui-2 max-w-ui-readable text-ui-body text-ui-text-muted text-balance">
          {description}
        </div>
      ) : null}
      {children ? <div className="mt-ui-4 w-full min-w-0">{children}</div> : null}
    </div>
  );
}
