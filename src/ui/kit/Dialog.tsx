/**
 * Dialog — Radix + semantic surfaces, scroll-safe on small viewports.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import type { ComponentPropsWithoutRef, HTMLAttributes } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogContent = ({
  className,
  ...props
}: DialogPrimitive.DialogContentProps) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/40 transition-opacity duration-ui-base motion-reduce:transition-none",
        "data-[state=open]:opacity-100 data-[state=closed]:opacity-0"
      )}
    />
    <DialogPrimitive.Content
      className={cn(
        "fixed left-1/2 top-1/2 z-50 max-h-[min(85dvh,40rem)] w-[min(100vw-1.5rem,28rem)] max-w-ui-modal-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain",
        "rounded-ui-lg border border-ui-border bg-ui-surface p-ui-6 shadow-modal",
        "outline-none focus:outline-none",
        className
      )}
      {...props}
    />
  </DialogPrimitive.Portal>
);

export const DialogTitle = ({
  className,
  ...props
}: DialogPrimitive.DialogTitleProps) => (
  <DialogPrimitive.Title
    className={cn(
      "min-w-0 text-balance text-ui-section-title text-text-primary",
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
    className={cn("mt-ui-2 text-ui-body text-ui-text-muted", className)}
    {...props}
  />
);

export const DialogHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-ui-4 min-w-0", className)} {...props} />
);
