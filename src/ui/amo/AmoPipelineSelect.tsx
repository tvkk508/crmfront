import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../cn";

export type AmoPipelineStage = {
  id: number;
  name: string;
  color?: string;
};

export type AmoPipelineSelectProps = {
  pipelineName: string;
  stages: AmoPipelineStage[];
  valueStageId: number;
  daysInStage?: number | null;
  onChangeStage: (stageId: number) => Promise<void> | void;
  disabled?: boolean;
  dataTestId?: string;
};

const getContrastColor = (bgColor: string): string => {
  // Parse hex or CSS color and determine if text should be light or dark
  const color = bgColor.replace("#", "");
  if (color.length === 6) {
    const r = parseInt(color.slice(0, 2), 16);
    const g = parseInt(color.slice(2, 4), 16);
    const b = parseInt(color.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
  }
  return "#1a1a1a";
};

const parseColor = (color?: string): string => {
  if (!color) return "#6b8bff";
  // Handle CSS variables like var(--amo-stage-blue)
  if (color.startsWith("var(")) {
    const varName = color.match(/var\(([^)]+)\)/)?.[1];
    if (varName && typeof document !== "undefined") {
      const computed = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      return computed || "#6b8bff";
    }
    return "#6b8bff";
  }
  return color;
};

export function AmoPipelineSelect({
  pipelineName,
  stages,
  valueStageId,
  daysInStage,
  onChangeStage,
  disabled = false,
  dataTestId = "deal-stage-select",
}: AmoPipelineSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const currentStage = stages.find((s) => s.id === valueStageId);
  const currentIndex = stages.findIndex((s) => s.id === valueStageId);

  const handleToggle = useCallback(() => {
    if (disabled || isLoading) return;
    setIsOpen((prev) => !prev);
    setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
  }, [disabled, isLoading, currentIndex]);

  const handleSelectStage = useCallback(
    async (stageId: number) => {
      if (disabled || isLoading || stageId === valueStageId) {
        setIsOpen(false);
        return;
      }
      setIsLoading(true);
      try {
        await onChangeStage(stageId);
      } catch (err) {
        console.error("Failed to change stage:", err);
      } finally {
        setIsLoading(false);
        setIsOpen(false);
      }
    },
    [disabled, isLoading, valueStageId, onChangeStage]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          handleToggle();
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, stages.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < stages.length) {
            void handleSelectStage(stages[focusedIndex].id);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    },
    [isOpen, handleToggle, focusedIndex, stages, handleSelectStage]
  );

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Scroll focused item into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-stage-item]");
      const item = items[focusedIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, focusedIndex]);

  const daysLabel = daysInStage != null && daysInStage > 0 ? `(${daysInStage} дн.)` : null;

  return (
    <div
      ref={containerRef}
      className="relative"
      data-testid={dataTestId}
    >
      {/* Collapsed view / Trigger */}
      <button
        type="button"
        className={cn(
          "w-full rounded-md border border-border bg-surface transition-colors",
          "hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
          disabled && "opacity-50 cursor-not-allowed",
          isLoading && "pointer-events-none"
        )}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        data-testid={`${dataTestId}-open`}
      >
        <div className="px-3 py-2">
          {/* Pipeline name + Stage name + Days */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0 text-left">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                {pipelineName}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-medium text-text-primary truncate">
                  {currentStage?.name ?? "—"}
                </span>
                {daysLabel && (
                  <span className="text-xs text-text-tertiary flex-shrink-0">{daysLabel}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {isLoading && (
                <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              )}
              <svg
                className={cn(
                  "w-4 h-4 text-text-tertiary transition-transform duration-150",
                  isOpen && "rotate-180"
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Color strip - showing all stages */}
          <div className="flex gap-0.5 mt-2">
            {stages.map((stage, index) => {
              const stageColor = parseColor(stage.color);
              const isCurrent = stage.id === valueStageId;
              const isBeforeCurrent = index <= currentIndex;
              return (
                <div
                  key={stage.id}
                  className={cn(
                    "h-1.5 flex-1 rounded-sm transition-all",
                    isCurrent && "ring-1 ring-offset-1 ring-gray-400"
                  )}
                  style={{
                    backgroundColor: stageColor,
                    opacity: isBeforeCurrent ? 1 : 0.35,
                  }}
                  title={stage.name}
                />
              );
            })}
          </div>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          className={cn(
            "absolute top-full left-0 right-0 z-50 mt-1",
            "rounded-md border border-border bg-surface shadow-lg",
            "max-h-[280px] overflow-y-auto",
            "animate-in fade-in-0 zoom-in-95 duration-150"
          )}
        >
          {stages.map((stage, index) => {
            const stageColor = parseColor(stage.color);
            const textColor = getContrastColor(stageColor.replace("#", ""));
            const isSelected = stage.id === valueStageId;
            const isFocused = focusedIndex === index;

            return (
              <button
                key={stage.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                data-stage-item
                data-testid={`deal-stage-option-${stage.id}`}
                className={cn(
                  "w-full px-3 py-2.5 text-left text-sm font-medium",
                  "flex items-center justify-between gap-2",
                  "transition-all duration-100",
                  isFocused && "ring-2 ring-inset ring-black/20",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
                style={{
                  backgroundColor: stageColor,
                  color: textColor,
                }}
                onClick={() => void handleSelectStage(stage.id)}
                disabled={isLoading}
              >
                <span className="truncate">{stage.name}</span>
                {isSelected && (
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

