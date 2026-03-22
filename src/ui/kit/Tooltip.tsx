/**
 * Tooltip — high contrast, viewport-clamped width, above dialogs.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../cn";

export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = ({
  className,
  sideOffset = 6,
  collisionPadding = 8,
  ...props
}: TooltipPrimitive.TooltipContentProps) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn(
        "z-[100] max-w-[min(20rem,calc(100vw-1rem))] rounded-ui-md border border-white/10",
        "bg-[rgb(var(--ui-color-text))] px-ui-3 py-ui-2 text-ui-caption text-white shadow-ui-overlay",
        "outline-none",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
);
