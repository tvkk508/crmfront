import type { ReactNode } from "react";
import { cn } from "../cn";
import { useUiSettingsStore } from "../../stores/uiSettings";

export type SectionProps = {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
};

export function Section({ id, title, children, className }: SectionProps) {
  const collapsed = useUiSettingsStore(
    (state) => state.collapsedSections[id] ?? false
  );
  const toggleSection = useUiSettingsStore((state) => state.toggleSection);

  return (
    <section className={cn("rounded-ui-lg", className)}>
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className="flex w-full min-w-0 items-center justify-between gap-ui-2 px-ui-2 py-ui-2 text-left text-ui-caption font-semibold uppercase tracking-wide text-ui-text-muted transition-colors duration-ui-fast hover:text-ui-text"
      >
        <span className="min-w-0 truncate">{title}</span>
        <svg
          aria-hidden="true"
          className={cn(
            "h-4 w-4 shrink-0 text-ui-text-muted transition-transform duration-ui-fast motion-reduce:transition-none",
            collapsed ? "rotate-180" : "rotate-0"
          )}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      {!collapsed ? <div className="min-w-0 px-ui-2 pb-ui-2">{children}</div> : null}
    </section>
  );
}
