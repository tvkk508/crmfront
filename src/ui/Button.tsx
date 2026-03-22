/**
 * Legacy Button API — compatibility bridge over canonical `ui/kit/Button`.
 *
 * Canonical for new code: `import { Button } from "../ui/kit"` with variants
 * `primary | secondary | tertiary | negative | positive` and sizes `small | medium | large`.
 *
 * Legacy mapping:
 * - `ghost` → `tertiary`
 * - `outline` → `secondary`
 * - `sm` → `small`, `md` → `medium`
 */
import { forwardRef } from "react";
import {
  Button as KitButton,
  IconButton as KitIconButton,
  type ButtonProps as KitButtonProps,
  type IconButtonProps as KitIconButtonProps,
} from "./kit/Button";

export type LegacyButtonVariant = "primary" | "ghost" | "outline";
export type LegacyButtonSize = "sm" | "md";

export type ButtonProps = Omit<KitButtonProps, "variant" | "size"> & {
  variant?: LegacyButtonVariant;
  size?: LegacyButtonSize;
};

function toKitVariant(v: LegacyButtonVariant): KitButtonProps["variant"] {
  if (v === "ghost") return "tertiary";
  if (v === "outline") return "secondary";
  return "primary";
}

function toKitSize(s: LegacyButtonSize): KitButtonProps["size"] {
  return s === "sm" ? "small" : "medium";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", ...props }, ref) => (
    <KitButton
      ref={ref}
      variant={toKitVariant(variant)}
      size={toKitSize(size)}
      {...props}
    />
  )
);

Button.displayName = "Button";

export type IconButtonProps = Omit<KitIconButtonProps, "variant" | "size"> & {
  variant?: LegacyButtonVariant;
  size?: LegacyButtonSize;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = "outline", size = "md", ...props }, ref) => (
    <KitIconButton
      ref={ref}
      variant={
        variant === "ghost"
          ? "tertiary"
          : variant === "outline"
            ? "secondary"
            : "primary"
      }
      size={toKitSize(size)}
      {...props}
    />
  )
);

IconButton.displayName = "IconButton";
