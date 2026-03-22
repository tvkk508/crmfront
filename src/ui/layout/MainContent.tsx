import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

export type MainContentProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

/**
 * Primary column beside sidebar: `min-w-0` + nested `amo-main__content` with `overflow-hidden`
 * so inner routes opt into `overflow-auto` (e.g. via `Page`).
 */
export function MainContent({ className, children, ...props }: MainContentProps) {
  return (
    <div className={cn("amo-main", className)} {...props}>
      <div className="amo-main__content">{children}</div>
    </div>
  );
}
