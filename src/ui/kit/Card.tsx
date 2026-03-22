/**
 * Canonical surface card — semantic radius, border, shadows.
 *
 * Phase 1 Update: Enhanced with new design token visual contracts,
 * improved shadows, and interactive variants.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

export type CardVariant = "default" | "outlined" | "elevated" | "muted" | "interactive";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  variant?: CardVariant;
  /** Add padding using the card-padding token */
  padded?: boolean;
};

export function Card({ 
  className, 
  variant = "default", 
  padded = false,
  children, 
  ...props 
}: CardProps) {
  return (
    <div
      className={cn(
        // Base styles
        "rounded-ui-card bg-ui-surface text-ui-text",
        "transition-all duration-ui-base ease-ui-ease",
        
        // Padding
        padded && "p-card-padding",
        
        // Variant styles
        variant === "default" && [
          "border border-ui-border-muted",
          "shadow-ui-card",
        ],
        
        variant === "outlined" && [
          "border border-ui-border",
          "shadow-none",
        ],
        
        variant === "elevated" && [
          "border border-ui-border-muted",
          "shadow-ui-md",
        ],
        
        variant === "muted" && [
          "bg-ui-surface-muted",
          "border border-ui-border-muted",
          "shadow-none",
        ],
        
        variant === "interactive" && [
          "border border-ui-border-muted",
          "shadow-ui-card",
          "cursor-pointer",
          "hover:border-ui-border hover:shadow-ui-card-hover",
          "active:shadow-ui-sm active:scale-[0.995]",
        ],
        
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Card header with consistent styling */
export type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        "px-card-padding py-ui-3",
        "border-b border-ui-border-muted",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Card title component */
export type CardTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  children?: ReactNode;
  as?: "h2" | "h3" | "h4";
};

export function CardTitle({ 
  className, 
  as: Comp = "h3", 
  children, 
  ...props 
}: CardTitleProps) {
  return (
    <Comp
      className={cn(
        "text-ui-subheading text-ui-text",
        "min-w-0 truncate",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

/** Card content area */
export type CardContentProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div
      className={cn("p-card-padding", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/** Card footer with consistent styling */
export type CardFooterProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-ui-2",
        "px-card-padding py-ui-3",
        "border-t border-ui-border-muted",
        "bg-ui-surface-subtle",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
