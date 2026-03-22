/**
 * Scroll viewport — semantic borders, `min-h-0` for flex, overscroll containment.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../cn";

export type ScrollAreaProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  orientation?: "vertical" | "horizontal" | "both";
};

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, orientation = "vertical", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "min-h-0 min-w-0 overscroll-contain",
          orientation === "vertical" && "overflow-y-auto overflow-x-hidden",
          orientation === "horizontal" && "overflow-x-auto overflow-y-hidden",
          orientation === "both" && "overflow-auto",
          "scrollbar-thin",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ScrollArea.displayName = "ScrollArea";
