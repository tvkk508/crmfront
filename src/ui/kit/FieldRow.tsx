import type { MouseEventHandler, ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";
import { cn } from "../cn";

export type FieldRowProps = {
  label: string;
  value?: ReactNode;
  href?: string;
  className?: string;
  valueClassName?: string;
  disableTooltip?: boolean;
  onValueDoubleClick?: MouseEventHandler<HTMLDivElement>;
  onValueClick?: MouseEventHandler<HTMLDivElement>;
};

export function FieldRow({
  label,
  value,
  href,
  className,
  valueClassName,
  disableTooltip,
  onValueDoubleClick,
  onValueClick,
}: FieldRowProps) {
  const isEmpty = value === null || value === undefined || value === "";
  const content = isEmpty ? "—" : value;
  const valueNode = href ? (
    <a className="text-button-primary hover:underline" href={href}>
      {content}
    </a>
  ) : (
    content
  );

  const valueWrapper = (
    <div
      className={cn(
        "min-w-0 w-full truncate",
        isEmpty && "text-text-disabled",
        valueClassName
      )}
      onDoubleClick={onValueDoubleClick}
      onClick={onValueClick}
    >
      {valueNode}
    </div>
  );

  return (
    <div
      className={cn(
        "grid grid-cols-1 items-start gap-ui-1 border-b border-ui-border/50 py-ui-2 text-ui-caption sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:items-center sm:gap-ui-3",
        "rounded-ui-sm px-ui-1 transition-colors duration-ui-fast hover:bg-ui-surface-muted/60",
        className
      )}
    >
      <div className="min-w-0 truncate font-medium text-text-tertiary">{label}</div>
      {disableTooltip ? (
        valueWrapper
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>{valueWrapper}</TooltipTrigger>
          <TooltipContent className="max-w-[min(24rem,calc(100vw-1.5rem))] break-words">
            {valueNode}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
