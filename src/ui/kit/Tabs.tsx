/**
 * Tabs — horizontal scroll on narrow viewports, semantic borders.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../cn";

export const Tabs = TabsPrimitive.Root;

export const TabsList = ({
  className,
  ...props
}: TabsPrimitive.TabsListProps) => (
  <TabsPrimitive.List
    className={cn(
      "flex min-h-0 w-full min-w-0 shrink-0 flex-nowrap items-stretch overflow-x-auto overflow-y-hidden border-b border-ui-border scrollbar-thin",
      "h-12 sm:h-14 md:h-[4.5rem]",
      className
    )}
    {...props}
  />
);

export const TabsTrigger = ({
  className,
  ...props
}: TabsPrimitive.TabsTriggerProps) => (
  <TabsPrimitive.Trigger
    className={cn(
      "flex h-full min-h-0 min-w-0 shrink-0 items-center justify-center px-ui-3 font-medium text-ui-text transition-colors duration-ui-fast",
      "border-b-2 border-transparent sm:px-ui-4",
      "cursor-pointer select-none hover:text-text-primary",
      "data-[state=active]:cursor-default data-[state=active]:border-text-primary data-[state=active]:text-text-primary",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus-ring/30 focus-visible:ring-offset-2 focus-visible:ring-offset-ui-background",
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
    className={cn("min-h-0 min-w-0 outline-none focus-visible:outline-none", className)}
    {...props}
  />
);
