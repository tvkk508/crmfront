import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

export type AppShellProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

/** Root CRM shell: flex row, full viewport, `overflow-hidden` — pairs with `Sidebar` + `MainContent`. */
export function AppShell({ className, children, ...props }: AppShellProps) {
  return (
    <div className={cn("amo-shell", className)} {...props}>
      {children}
    </div>
  );
}
