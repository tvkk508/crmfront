/**
 * Canonical component layer for Drivengo CRM UI.
 * Tokens: `src/ui-tokens.css` (`--ui-*`); Tailwind theme: `ui.*` colors, spacing, type, shadows.
 *
 * UI Kit - Components adapted from platform-develop
 * Phase 1 Update: Enhanced exports with new component variants and sub-components.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 * Source: references/platform-develop/packages/ui/src/components/
 */

// Button
export {
  Button,
  IconButton,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
  type IconButtonProps,
} from "./Button";

// Input & Form
export { 
  Input, 
  Textarea,
  FormField,
  type InputProps,
  type TextareaProps,
  type FormFieldProps,
} from "./Input";

// Card
export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  type CardProps,
  type CardVariant,
  type CardHeaderProps,
  type CardTitleProps,
  type CardContentProps,
  type CardFooterProps,
} from "./Card";

// Badge
export { 
  Badge, 
  StatusBadge,
  type BadgeProps, 
  type BadgeVariant,
  type BadgeSize,
  type StatusBadgeProps,
} from "./Badge";

// Tag
export { 
  Tag, 
  TagGroup,
  type TagProps, 
  type TagVariant,
  type TagSize,
  type TagGroupProps,
} from "./Tag";

// Empty State
export { 
  EmptyState, 
  EmptyStateInline,
  type EmptyStateProps,
  type EmptyStateSize,
  type EmptyStateInlineProps,
} from "./EmptyState";

// Tabs
export { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent,
  TabBadge,
  type TabsListVariant,
  type TabBadgeProps,
} from "./Tabs";

// Dialog
export { 
  Dialog, 
  DialogTrigger, 
  DialogClose,
  DialogContent, 
  DialogHeader,
  DialogTitle, 
  DialogDescription,
  DialogBody,
  DialogFooter,
  type DialogSize,
  type DialogContentProps,
} from "./Dialog";

// Dropdown Menu
export { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuShortcut,
} from "./DropdownMenu";

// Tooltip
export { 
  Tooltip, 
  TooltipProvider,
  TooltipTrigger, 
  TooltipContent,
  TooltipArrow,
} from "./Tooltip";

// Other components
export { Separator, type SeparatorProps } from "./Separator";
export { Skeleton, type SkeletonProps } from "./Skeleton";
export { ScrollArea, type ScrollAreaProps } from "./ScrollArea";
export { FieldRow, type FieldRowProps } from "./FieldRow";
export { Section, type SectionProps } from "./Section";
export { Splitter, type SplitterProps } from "./Splitter";

// Layout components
export * from "../layout";

// Table components
export * from "./table";

// Form components
export * from "./form";
