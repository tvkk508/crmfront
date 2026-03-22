import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

export type PageProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  /** Default horizontal/vertical padding inside the main column */
  padded?: boolean;
};

/**
 * Route-level canvas: `flex-1 min-h-0 min-w-0` — use with `overflow-auto` when the page should scroll.
 */
export function Page({ className, children, padded = true, ...props }: PageProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col",
        padded && "gap-ui-4 p-ui-3 sm:p-ui-4 md:p-ui-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
