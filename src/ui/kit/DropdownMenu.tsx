/**
 * Dropdown menu — Radix + scroll/clamp for long lists and small viewports.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "../cn";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuContent = ({
  className,
  sideOffset = 6,
  collisionPadding = 12,
  ...props
}: DropdownMenuPrimitive.DropdownMenuContentProps) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn(
        "z-50 max-h-[min(70dvh,20rem)] min-w-[10rem] overflow-y-auto overscroll-contain rounded-ui-md border border-ui-border bg-ui-surface p-ui-1 text-ui-body shadow-popover",
        "outline-none focus:outline-none",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
);

export const DropdownMenuItem = ({
  className,
  ...props
}: DropdownMenuPrimitive.DropdownMenuItemProps) => (
  <DropdownMenuPrimitive.Item
    className={cn(
      "flex min-h-[2.25rem] cursor-pointer select-none items-center rounded-ui-sm px-ui-3 py-ui-2 outline-none",
      "text-ui-body transition-colors duration-ui-fast",
      "focus:bg-ui-surface-muted focus:text-text-primary",
      "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-ui-disabled",
      className
    )}
    {...props}
  />
);

export const DropdownMenuSeparator = ({
  className,
  ...props
}: DropdownMenuPrimitive.DropdownMenuSeparatorProps) => (
  <DropdownMenuPrimitive.Separator
    className={cn("my-ui-1 h-px bg-ui-border", className)}
    {...props}
  />
);
