import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

export type SidebarProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
};

/** Fixed amo rail — width from tokens (`--amo-sidebar-width`), narrower below `640px` in `pipeline.amo.css`. */
export function Sidebar({ className, children, ...props }: SidebarProps) {
  return (
    <aside className={cn("amo-sidebar", className)} {...props}>
      {children}
    </aside>
  );
}
