import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Badge } from "../../ui/kit";

type DealActivityProps = {
  rightOpen: boolean;
  onToggleRight: () => void;
};

export function DealActivity({ rightOpen, onToggleRight }: DealActivityProps) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const items = useMemo(
    () =>
      Array.from({ length: 80 }, (_, index) => ({
        id: index + 1,
        author: index % 2 === 0 ? "I. Chen" : "A. Rivera",
        time: `${index + 1}h ago`,
        text: `Activity note ${index + 1}: Follow-up and internal update for the deal.`,
        type: index % 3 === 0 ? "Call" : "Note",
      })),
    []
  );

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 6,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div className="flex h-full min-h-0 flex-col rounded-12 border border-border bg-surface">
      <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border bg-surface px-[var(--space-16)] py-[var(--space-12)]">
        <div>
          <div className="text-14 font-semibold">Activity</div>
          <div className="text-12 text-muted">Virtualized timeline</div>
        </div>
        <button
          type="button"
          onClick={onToggleRight}
          className="rounded-8 border border-border px-2 py-1 text-12 text-muted hover:bg-surface-muted hover:text-text"
        >
          {rightOpen ? "Hide widgets" : "Show widgets"}
        </button>
      </div>
      <div ref={parentRef} className="min-h-0 flex-1 overflow-y-auto">
        <div
          className="relative"
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {virtualItems.map((virtualRow) => {
            const item = items[virtualRow.index];
            return (
              <div
                key={item.id}
                className="absolute left-0 top-0 w-full px-[var(--space-16)] py-[var(--space-12)]"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                <div className="rounded-10 border border-border bg-surface-muted p-3">
                  <div className="flex items-center justify-between text-12 text-muted">
                    <span>{item.author}</span>
                    <span>{item.time}</span>
                  </div>
                  <div className="mt-2 text-13 text-text">{item.text}</div>
                  <div className="mt-2">
                    <Badge variant="accent">{item.type}</Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
