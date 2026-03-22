/**
 * Canonical component layer for Drivengo CRM UI.
 * Tokens: `src/ui-tokens.css` (`--ui-*`); Tailwind theme: `ui.*` colors, spacing, type, shadows.
 *
 * UI Kit - Components adapted from platform-develop
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 * Source: references/platform-develop/packages/ui/src/components/
 */

export {
  Button,
  IconButton,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
  type IconButtonProps,
} from "./Button";
export { Input, type InputProps } from "./Input";
export { Card, type CardProps } from "./Card";
export { Separator, type SeparatorProps } from "./Separator";
export { Skeleton, type SkeletonProps } from "./Skeleton";
export { Tag, type TagProps } from "./Tag";
export { EmptyState, type EmptyStateProps } from "./EmptyState";
export { ScrollArea, type ScrollAreaProps } from "./ScrollArea";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";
export { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "./Dialog";
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "./DropdownMenu";
export { Tooltip, TooltipTrigger, TooltipContent } from "./Tooltip";
export { Badge, type BadgeProps } from "./Badge";
export { FieldRow, type FieldRowProps } from "./FieldRow";
export { Section, type SectionProps } from "./Section";
export { Splitter, type SplitterProps } from "./Splitter";

export * from "../layout";
export * from "./table";
export * from "./form";
