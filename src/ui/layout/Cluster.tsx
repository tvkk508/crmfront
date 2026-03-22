import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

const gapClass = {
  none: "gap-0",
  xs: "gap-ui-1",
  sm: "gap-ui-2",
  md: "gap-ui-3",
  lg: "gap-ui-4",
} as const;

export type ClusterGap = keyof typeof gapClass;

export type ClusterProps<T extends ElementType = "div"> = {
  as?: T;
  children?: ReactNode;
  gap?: ClusterGap;
  /** Align items on the cross axis */
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "as">;

const alignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
} as const;

const justifyMap = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
} as const;

export function Cluster<T extends ElementType = "div">({
  as,
  gap = "sm",
  align = "center",
  justify = "start",
  className,
  children,
  ...props
}: ClusterProps<T>) {
  const Comp = (as ?? "div") as ElementType;
  return (
    <Comp
      className={cn(
        "flex min-w-0 flex-row flex-wrap",
        gapClass[gap],
        alignMap[align],
        justifyMap[justify],
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
