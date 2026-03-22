import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../cn";

export type FormSectionProps = HTMLAttributes<HTMLElement> & {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
};

/**
 * Grouped fields — distinct from collapsible `Section` (ui settings).
 * Use for wizard steps / settings blocks inside forms.
 */
export function FormSection({
  className,
  title,
  description,
  children,
  ...props
}: FormSectionProps) {
  return (
    <section
      className={cn(
        "rounded-ui-lg border border-ui-border bg-ui-surface p-ui-4 sm:p-ui-5",
        className
      )}
      {...props}
    >
      {title != null ? (
        <h2 className="text-ui-section-title text-text-primary">{title}</h2>
      ) : null}
      {description != null ? (
        <p className="mt-ui-1 text-ui-body text-ui-text-muted">{description}</p>
      ) : null}
      <div
        className={cn(
          "flex min-w-0 flex-col gap-ui-4",
          title != null || description != null ? "mt-ui-4" : ""
        )}
      >
        {children}
      </div>
    </section>
  );
}
