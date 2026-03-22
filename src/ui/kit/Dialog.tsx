/**
 * Dialog — Radix + semantic surfaces, scroll-safe on small viewports.
 *
 * Phase 1 Update: Enhanced with new design tokens, animations, and visual hierarchy.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import type { ComponentPropsWithoutRef, HTMLAttributes } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../cn";
import { IconButton } from "./Button";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export type DialogSize = "sm" | "md" | "lg" | "xl" | "full";

const sizeClasses: Record<DialogSize, string> = {
  sm: "w-[min(100vw-1.5rem,24rem)] max-w-ui-modal-sm",
  md: "w-[min(100vw-1.5rem,32rem)] max-w-ui-modal-md",
  lg: "w-[min(100vw-1.5rem,40rem)] max-w-ui-modal-lg",
  xl: "w-[min(100vw-1.5rem,56rem)]",
  full: "w-[min(100vw-1.5rem,90vw)]",
};

export type DialogContentProps = DialogPrimitive.DialogContentProps & {
  size?: DialogSize;
  /** Show close button in top-right */
  showClose?: boolean;
};

export const DialogContent = ({
  className,
  size = "md",
  showClose = true,
  children,
  ...props
}: DialogContentProps) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50",
        "bg-black/50 backdrop-blur-[2px]",
        // Animation
        "data-[state=open]:animate-in data-[state=open]:fade-in-0",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        "duration-ui-base"
      )}
    />
    <DialogPrimitive.Content
      className={cn(
        // Positioning
        "fixed left-1/2 top-1/2 z-50",
        "-translate-x-1/2 -translate-y-1/2",
        
        // Sizing
        "max-h-[min(85dvh,40rem)]",
        sizeClasses[size],
        
        // Scrolling
        "overflow-y-auto overscroll-contain",
        
        // Visual styling
        "rounded-ui-xl",
        "border border-ui-border-muted",
        "bg-ui-surface",
        "shadow-ui-modal",
        
        // Animation
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "duration-ui-base",
        
        "outline-none focus:outline-none",
        className
      )}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close asChild>
          <IconButton
            variant="ghost"
            size="small"
            className="absolute right-ui-3 top-ui-3"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </IconButton>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);

export const DialogHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn(
      "px-ui-6 pt-ui-6 pb-ui-4",
      "min-w-0",
      className
    )} 
    {...props} 
  />
);

export const DialogTitle = ({
  className,
  ...props
}: DialogPrimitive.DialogTitleProps) => (
  <DialogPrimitive.Title
    className={cn(
      "text-ui-section-title text-ui-text",
      "text-balance min-w-0",
      "pr-ui-8", // Space for close button
      className
    )}
    {...props}
  />
);

export const DialogDescription = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) => (
  <DialogPrimitive.Description
    className={cn(
      "mt-ui-1.5 text-ui-body text-ui-text-muted",
      "text-pretty",
      className
    )}
    {...props}
  />
);

export const DialogBody = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn(
      "px-ui-6 py-ui-4",
      "min-w-0",
      className
    )} 
    {...props} 
  />
);

export const DialogFooter = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn(
      "flex items-center justify-end gap-ui-2",
      "px-ui-6 py-ui-4",
      "border-t border-ui-border-muted",
      "bg-ui-surface-subtle",
      "rounded-b-ui-xl",
      className
    )} 
    {...props} 
  />
);
