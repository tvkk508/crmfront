import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

export type AppHeaderProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
  /** Sticky within a scrolling ancestor (ensure that ancestor is `overflow-auto`, not `hidden`). */
  sticky?: boolean;
};

/**
 * Optional top bar inside `MainContent` (global chrome lives in `Sidebar`).
 * Default: sticky, semantic border/background, safe-area padding on notched devices.
 */
export function AppHeader({ className, children, sticky = true, ...props }: AppHeaderProps) {
  return (
    <header
      className={cn(
        "min-w-0 shrink-0 border-b border-ui-border bg-ui-surface",
        "px-ui-3 py-ui-2 sm:px-ui-4 sm:py-ui-3",
        "pt-[max(var(--ui-space-2),env(safe-area-inset-top))]",
        sticky && "sticky top-0 z-10",
        className
      )}
      {...props}
    >
      {children}
    </header>
  );
}
