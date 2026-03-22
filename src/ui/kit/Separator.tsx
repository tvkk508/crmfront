/**
 * Separator component adapted from platform-develop
 * Styles based on platform-develop separator patterns
 * 
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 * Source: references/platform-develop/packages/ui/src/components/Separator.svelte
 */
import type { HTMLAttributes } from "react";
import { cn } from "../cn";

export type SeparatorProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
};

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorProps) {
  return (
    <div
      className={cn(
        "bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  );
}

