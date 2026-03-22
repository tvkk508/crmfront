/**
 * Dropdown menu — Radix + scroll/clamp for long lists and small viewports.
 *
 * Phase 1 Update: Enhanced with new design tokens, animations, and better hover states.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "../cn";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

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
        // Sizing & overflow
        "z-50 min-w-[10rem]",
        "max-h-[min(70dvh,24rem)] overflow-y-auto overscroll-contain",
        
        // Visual styling
        "rounded-ui-lg",
        "border border-ui-border-muted",
        "bg-ui-surface",
        "p-ui-1",
        "text-ui-body",
        "shadow-ui-popover",
        
        // Animation
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2",
        "data-[side=top]:slide-in-from-bottom-2",
        
        "outline-none focus:outline-none",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
);

export const DropdownMenuItem = ({
  className,
  inset,
  ...props
}: DropdownMenuPrimitive.DropdownMenuItemProps & { inset?: boolean }) => (
  <DropdownMenuPrimitive.Item
    className={cn(
      // Layout
      "relative flex items-center gap-ui-2",
      "min-h-[34px] px-ui-2.5 py-ui-1.5",
      "rounded-ui-md",
      
      // Typography
      "text-ui-body-sm text-ui-text",
      "select-none cursor-pointer",
      
      // States
      "outline-none",
      "transition-colors duration-ui-fast",
      "focus:bg-ui-surface-hover focus:text-ui-text",
      "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-ui-disabled data-[disabled]:pointer-events-none",
      
      // Inset for checkbox/radio items
      inset && "pl-ui-8",
      
      className
    )}
    {...props}
  />
);

export const DropdownMenuCheckboxItem = ({
  className,
  children,
  checked,
  ...props
}: DropdownMenuPrimitive.DropdownMenuCheckboxItemProps) => (
  <DropdownMenuPrimitive.CheckboxItem
    className={cn(
      "relative flex items-center gap-ui-2",
      "min-h-[34px] pl-ui-8 pr-ui-2.5 py-ui-1.5",
      "rounded-ui-md",
      "text-ui-body-sm text-ui-text",
      "select-none cursor-pointer",
      "outline-none",
      "transition-colors duration-ui-fast",
      "focus:bg-ui-surface-hover",
      "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-ui-disabled",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-ui-2.5 flex h-4 w-4 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-ui-accent" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
);

export const DropdownMenuRadioItem = ({
  className,
  children,
  ...props
}: DropdownMenuPrimitive.DropdownMenuRadioItemProps) => (
  <DropdownMenuPrimitive.RadioItem
    className={cn(
      "relative flex items-center gap-ui-2",
      "min-h-[34px] pl-ui-8 pr-ui-2.5 py-ui-1.5",
      "rounded-ui-md",
      "text-ui-body-sm text-ui-text",
      "select-none cursor-pointer",
      "outline-none",
      "transition-colors duration-ui-fast",
      "focus:bg-ui-surface-hover",
      "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-ui-disabled",
      className
    )}
    {...props}
  >
    <span className="absolute left-ui-2.5 flex h-4 w-4 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-ui-accent text-ui-accent" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
);

export const DropdownMenuLabel = ({
  className,
  inset,
  ...props
}: DropdownMenuPrimitive.DropdownMenuLabelProps & { inset?: boolean }) => (
  <DropdownMenuPrimitive.Label
    className={cn(
      "px-ui-2.5 py-ui-1.5",
      "text-ui-overline text-ui-text-muted uppercase",
      inset && "pl-ui-8",
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
    className={cn(
      "my-ui-1 -mx-ui-1 h-px bg-ui-border-muted",
      className
    )}
    {...props}
  />
);

export const DropdownMenuSubTrigger = ({
  className,
  children,
  inset,
  ...props
}: DropdownMenuPrimitive.DropdownMenuSubTriggerProps & { inset?: boolean }) => (
  <DropdownMenuPrimitive.SubTrigger
    className={cn(
      "relative flex items-center gap-ui-2",
      "min-h-[34px] px-ui-2.5 py-ui-1.5",
      "rounded-ui-md",
      "text-ui-body-sm text-ui-text",
      "select-none cursor-pointer",
      "outline-none",
      "transition-colors duration-ui-fast",
      "focus:bg-ui-surface-hover",
      "data-[state=open]:bg-ui-surface-hover",
      inset && "pl-ui-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4 text-ui-text-muted" />
  </DropdownMenuPrimitive.SubTrigger>
);

export const DropdownMenuSubContent = ({
  className,
  ...props
}: DropdownMenuPrimitive.DropdownMenuSubContentProps) => (
  <DropdownMenuPrimitive.SubContent
    className={cn(
      "z-50 min-w-[8rem]",
      "max-h-[min(70dvh,24rem)] overflow-y-auto overscroll-contain",
      "rounded-ui-lg",
      "border border-ui-border-muted",
      "bg-ui-surface",
      "p-ui-1",
      "text-ui-body",
      "shadow-ui-popover",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-2",
      "data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2",
      "data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
);

/** Shortcut text display */
export const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "ml-auto text-ui-caption text-ui-text-tertiary tracking-widest",
      className
    )}
    {...props}
  />
);
