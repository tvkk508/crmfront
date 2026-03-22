/**
 * Tooltip — high contrast, viewport-clamped width, above dialogs.
 *
 * Phase 1 Update: Enhanced with new design tokens and animations.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../cn";

export const TooltipProvider = TooltipPrimitive.Provider;
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
        // Positioning & sizing
        "z-[100] max-w-[min(20rem,calc(100vw-1rem))]",
        
        // Visual styling
        "rounded-ui-md",
        "bg-ui-text text-ui-text-inverse",
        "px-ui-2.5 py-ui-1.5",
        "text-ui-caption leading-snug",
        "shadow-ui-popover",
        
        // Border for subtle definition
        "border border-white/5",
        
        // Animation
        "animate-in fade-in-0 zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2",
        "data-[side=top]:slide-in-from-bottom-2",
        
        "outline-none select-none",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
);

/** TooltipArrow for pointer */
export const TooltipArrow = ({
  className,
  ...props
}: TooltipPrimitive.TooltipArrowProps) => (
  <TooltipPrimitive.Arrow
    className={cn("fill-ui-text", className)}
    {...props}
  />
);
