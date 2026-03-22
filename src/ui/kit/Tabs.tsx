/**
 * Tabs — horizontal scroll on narrow viewports, semantic borders.
 *
 * Phase 1 Update: Enhanced with new design tokens for better
 * visual hierarchy and interactive states.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../cn";

export const Tabs = TabsPrimitive.Root;

export type TabsListVariant = "underline" | "pills" | "bordered";

export const TabsList = ({
  className,
  variant = "underline",
  ...props
}: TabsPrimitive.TabsListProps & { variant?: TabsListVariant }) => (
  <TabsPrimitive.List
    className={cn(
      "flex min-h-0 w-full min-w-0 shrink-0 flex-nowrap items-stretch",
      "overflow-x-auto overflow-y-hidden scrollbar-thin",
      
      // Variant styles
      variant === "underline" && [
        "border-b border-ui-border-muted",
        "gap-0",
      ],
      variant === "pills" && [
        "bg-ui-surface-muted rounded-ui-lg p-ui-1",
        "gap-ui-1",
      ],
      variant === "bordered" && [
        "bg-ui-surface border border-ui-border rounded-ui-lg p-ui-1",
        "gap-ui-1",
      ],
      
      className
    )}
    {...props}
  />
);

export const TabsTrigger = ({
  className,
  variant = "underline",
  ...props
}: TabsPrimitive.TabsTriggerProps & { variant?: TabsListVariant }) => (
  <TabsPrimitive.Trigger
    className={cn(
      // Base styles
      "flex min-h-0 min-w-0 shrink-0 items-center justify-center",
      "font-ui-button text-ui-body-sm",
      "cursor-pointer select-none",
      "transition-all duration-ui-fast ease-ui-ease",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-ui-background",
      
      // Underline variant (default)
      variant === "underline" && [
        "h-ui-tab px-ui-4",
        "border-b-2 border-transparent",
        "text-ui-text-secondary",
        "hover:text-ui-text hover:bg-ui-surface-hover",
        "data-[state=active]:border-ui-accent data-[state=active]:text-ui-text data-[state=active]:cursor-default",
      ],
      
      // Pills variant
      variant === "pills" && [
        "h-[calc(var(--ui-tab-height)-8px)] px-ui-3",
        "rounded-ui-md",
        "text-ui-text-secondary",
        "hover:text-ui-text hover:bg-ui-surface-hover",
        "data-[state=active]:bg-ui-surface data-[state=active]:text-ui-text data-[state=active]:shadow-ui-sm data-[state=active]:cursor-default",
      ],
      
      // Bordered variant
      variant === "bordered" && [
        "h-[calc(var(--ui-tab-height)-8px)] px-ui-3",
        "rounded-ui-md",
        "text-ui-text-secondary",
        "hover:text-ui-text hover:bg-ui-surface-hover",
        "data-[state=active]:bg-ui-accent data-[state=active]:text-ui-text-inverse data-[state=active]:shadow-ui-sm data-[state=active]:cursor-default",
      ],
      
      className
    )}
    {...props}
  />
);

export const TabsContent = ({
  className,
  ...props
}: TabsPrimitive.TabsContentProps) => (
  <TabsPrimitive.Content
    className={cn(
      "min-h-0 min-w-0 outline-none",
      "focus-visible:outline-none",
      "data-[state=inactive]:hidden",
      className
    )}
    {...props}
  />
);

/** Tab badge/counter for showing counts */
export type TabBadgeProps = {
  count: number;
  variant?: "neutral" | "accent";
  className?: string;
};

export function TabBadge({ count, variant = "neutral", className }: TabBadgeProps) {
  return (
    <span
      className={cn(
        "ml-ui-2 inline-flex items-center justify-center",
        "min-w-[18px] h-[18px] px-ui-1",
        "text-[10px] font-semibold tabular-nums",
        "rounded-ui-full",
        variant === "neutral" && "bg-ui-surface-muted text-ui-text-muted",
        variant === "accent" && "bg-ui-accent-subtle text-ui-accent",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
