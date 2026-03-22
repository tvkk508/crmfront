import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

const gapClass = {
  none: "gap-0",
  xs: "gap-ui-1",
  sm: "gap-ui-2",
  md: "gap-ui-3",
  lg: "gap-ui-4",
} as const;

export type StackGap = keyof typeof gapClass;

export type StackProps<T extends ElementType = "div"> = {
  as?: T;
  children?: ReactNode;
  gap?: StackGap;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "as">;

export function Stack<T extends ElementType = "div">({
  as,
  gap = "md",
  className,
  children,
  ...props
}: StackProps<T>) {
  const Comp = (as ?? "div") as ElementType;
  return (
    <Comp
      className={cn("flex min-w-0 flex-col", gapClass[gap], className)}
      {...props}
    >
      {children}
    </Comp>
  );
}
