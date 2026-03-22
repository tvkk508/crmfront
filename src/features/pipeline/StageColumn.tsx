import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { CSSProperties, FormEvent } from "react";
import { Fragment, useRef, useState } from "react";
import type { Deal, Stage } from "../../api/view-types";
import { cn } from "../../ui/cn";
import { Button, Input, EmptyState } from "../../ui/kit";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/kit";
import { DealCard } from "./DealCard";
import { formatRubles } from "./format";

type StageColumnProps = {
  stage: Stage;
  deals: Deal[];
  index: number;
  onQuickAdd?: (stageId: string, contact: string) => void;
  placeholderIndex?: number | null;
  placeholderHeight?: number | null;
};

export function StageColumn({
  stage,
  deals,
  index,
  onQuickAdd,
  placeholderIndex,
  placeholderHeight,
}: StageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${stage.id}`,
  });
  const [quickValue, setQuickValue] = useState("");
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const columnStyle = { "--stage-color": stage.color } as CSSProperties;
  const isFirstStage = index === 0;
  const showPlaceholder = typeof placeholderIndex === "number";
  const placeholderStyle = placeholderHeight
    ? { height: placeholderHeight }
    : undefined;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = quickValue.trim();
    if (!trimmed || !onQuickAdd) {
      return;
    }
    onQuickAdd(stage.id, trimmed);
    setQuickValue("");
  };

  const renderPlaceholder = (key: string) => (
    <div
      key={key}
      className="border border-dashed border-button-primary/35 rounded-sm bg-button-primary/5 min-h-[48px] w-full box-border"
      style={placeholderStyle}
    />
  );

  const handleBodyRef = (node: HTMLDivElement | null) => {
    bodyRef.current = node;
    setNodeRef(node);
  };

  return (
    <div
      style={{ animationDelay: `${index * 40}ms`, ...columnStyle }}
      data-testid={`stage-column-${stage.id}`}
      className={cn(
        "stagger-in relative flex flex-col w-[260px] min-w-[260px] h-full min-h-0",
        "bg-surface border border-border rounded-md transition-all duration-150",
        "before:content-[''] before:absolute before:-top-px before:-left-px before:-right-px before:h-[3px]",
        "before:rounded-t-md before:bg-[var(--stage-color,rgb(var(--color-accent)))]",
        isOver && "border-button-primary/55 bg-button-primary/5 shadow-[0_0_0_1px_rgba(var(--color-accent),0.15)]"
      )}
    >
      {/* Column Header */}
      <div className="flex items-start justify-between gap-2 p-3 pb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold uppercase tracking-wide text-text-primary truncate">
            {stage.title}
          </h3>
          <p className="mt-0.5 text-xs text-text-tertiary">
            {stage.dealCount} сделок • <span className="tabular-nums">{formatRubles(stage.valueSum)}</span>
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-xs",
                "border border-border bg-surface-muted text-text-tertiary",
                "hover:bg-button-secondary-hover hover:text-text-primary hover:border-border",
                "transition-colors text-sm font-semibold"
              )}
            >
              +
            </button>
          </TooltipTrigger>
          <TooltipContent>Добавить сделку</TooltipContent>
        </Tooltip>
      </div>

      {/* Column Body */}
      <div
        ref={handleBodyRef}
        className={cn(
          "flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto overflow-x-hidden",
          "px-2 pb-2 pr-1 relative",
          "scrollbar-thin scrollbar-thumb-slate-300/40 scrollbar-track-transparent",
          deals.length === 0 && "min-h-[180px]"
        )}
      >
        {/* Quick Add Form (only first column) */}
        {isFirstStage ? (
          <form
            className="border border-dashed border-border bg-surface-muted rounded-sm p-2 flex flex-col gap-2"
            onSubmit={handleSubmit}
          >
            <span className="text-[11px] text-text-tertiary">Быстрое добавление</span>
            <div className="flex items-center gap-1.5">
              <Input
                className="flex-1"
                value={quickValue}
                onChange={(event) => setQuickValue(event.target.value)}
                placeholder="Контакт / телефон / название"
                size="small"
              />
              <Button
                type="submit"
                variant="secondary"
                size="small"
                className="min-w-[28px] px-1.5"
              >
                +
              </Button>
            </div>
          </form>
        ) : null}

        {/* Deals or Empty State */}
        {deals.length === 0 ? (
          showPlaceholder ? (
            renderPlaceholder(`placeholder-${stage.id}-empty`)
          ) : (
            <EmptyState
              title=""
              description="Перетащите сюда сделку"
              className="flex-1"
            />
          )
        ) : (
          <SortableContext
            items={deals.map((deal) => deal.id)}
            strategy={verticalListSortingStrategy}
          >
            {deals.map((deal, dealIndex) => (
              <Fragment key={deal.id}>
                {showPlaceholder && placeholderIndex === dealIndex
                  ? renderPlaceholder(`placeholder-${stage.id}-${dealIndex}`)
                  : null}
                <DealCard deal={deal} />
              </Fragment>
            ))}
            {showPlaceholder && placeholderIndex === deals.length
              ? renderPlaceholder(`placeholder-${stage.id}-end`)
              : null}
          </SortableContext>
        )}
      </div>
    </div>
  );
}

