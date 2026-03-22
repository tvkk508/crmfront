/**
 * Shared focus/disabled/hover styles for native form controls.
 *
 * Phase 1 Update: Enhanced with new design tokens for consistent interactive states.
 *
 * Licensed under EPL-2.0 (Eclipse Public License 2.0)
 */

/** Focus ring styles - consistent across all form controls */
export const controlFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus-ring/35 focus-visible:ring-offset-0 focus-visible:border-ui-accent";

/** Disabled state styles */
export const controlDisabled =
  "disabled:cursor-not-allowed disabled:bg-ui-surface-muted disabled:text-ui-text-tertiary disabled:opacity-ui-disabled disabled:border-ui-border-muted disabled:pointer-events-none";

/** Hover state for form controls */
export const controlHover =
  "hover:border-ui-border-strong hover:bg-ui-surface";

/** Error state styling */
export const controlError =
  "border-ui-danger focus-visible:border-ui-danger focus-visible:ring-ui-danger/25";

/** Base control styles - shared foundation */
export const controlBase = [
  "w-full min-w-0",
  "rounded-ui-input",
  "border border-ui-border",
  "bg-ui-surface text-ui-text",
  "transition-all duration-ui-fast ease-ui-ease",
].join(" ");

/** Size variants for controls */
export const controlSizes = {
  small: "h-ui-input-sm min-h-ui-input-sm px-ui-2.5 text-ui-body-sm",
  medium: "h-ui-input-md min-h-ui-input-md px-ui-3 text-ui-body",
  large: "h-ui-input-lg min-h-ui-input-lg px-ui-3.5 text-ui-body-lg",
} as const;
