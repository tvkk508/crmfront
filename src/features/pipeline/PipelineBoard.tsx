import {
  DndContext,
  DragOverlay,
  PointerSensor,
  MeasuringStrategy,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  ClientRect,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, PointerEvent, WheelEvent } from "react";
import type { Deal } from "../../api/view-types";
import { cn } from "../../ui/cn";
import { EmptyState } from "../../ui/kit";
import { DealCardOverlay } from "./DealCard";
import {
  type PipelineFilters,
  useCreateDealMutation,
  useMoveDealMutation,
  usePipelineQuery,
} from "./usePipeline";
import { StageColumn } from "./StageColumn";

type PipelineBoardProps = {
  filters?: PipelineFilters;
};

export function PipelineBoard({ filters }: PipelineBoardProps) {
  const { data, isLoading, isError } = usePipelineQuery(filters);
  const moveDeal = useMoveDealMutation(filters);
  const createDeal = useCreateDealMutation(filters);
  const [toast, setToast] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeRect, setActiveRect] = useState<ClientRect | null>(null);
  const [overStageId, setOverStageId] = useState<string | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [isDragScrolling, setIsDragScrolling] = useState(false);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const dragScrollRef = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    pointerId: null as number | null,
    moved: false,
  });
  const suppressClickRef = useRef(false);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );
  const collisionDetection = (args: Parameters<typeof pointerWithin>[0]) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    return rectIntersection(args);
  };

  const dealsById = useMemo(() => {
    const map = new Map<string, Deal>();
    data?.deals.forEach((deal) => map.set(deal.id, deal));
    return map;
  }, [data]);

  const dealsByStage = useMemo(() => {
    const map = new Map<string, Deal[]>();
    data?.stages.forEach((stage) => map.set(stage.id, []));
    data?.deals.forEach((deal) => {
      const bucket = map.get(deal.stageId) ?? [];
      bucket.push(deal);
      map.set(deal.stageId, bucket);
    });
    return map;
  }, [data]);

  const activeDeal = activeId ? dealsById.get(activeId) : null;

  const resetDragState = () => {
    setActiveId(null);
    setActiveRect(null);
    setOverStageId(null);
    setOverIndex(null);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    const rect = active.rect.current?.initial ?? active.rect.current?.translated;
    setActiveId(String(active.id));
    setActiveRect(rect ?? null);
  };

  const handleDragOver = ({ over, active }: DragOverEvent) => {
    if (!over || !data) {
      setOverStageId(null);
      setOverIndex(null);
      return;
    }

    const overId = String(over.id);
    if (overId === String(active.id)) {
      setOverStageId(null);
      setOverIndex(null);
      return;
    }

    const stageId = overId.startsWith("stage-")
      ? overId.replace("stage-", "")
      : dealsById.get(overId)?.stageId;

    if (!stageId) {
      setOverStageId(null);
      setOverIndex(null);
      return;
    }

    const stageDeals = dealsByStage.get(stageId) ?? [];
    const index = stageDeals.findIndex((deal) => deal.id === overId);

    setOverStageId(stageId);
    setOverIndex(index >= 0 ? index : stageDeals.length);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !data) {
      resetDragState();
      return;
    }

    const activeIdValue = String(active.id);
    const overId = String(over.id);
    const draggedDeal = dealsById.get(activeIdValue);
    if (!draggedDeal) {
      resetDragState();
      return;
    }

    const targetStageId = overId.startsWith("stage-")
      ? overId.replace("stage-", "")
      : dealsById.get(overId)?.stageId;

    if (!targetStageId || targetStageId === draggedDeal.stageId) {
      resetDragState();
      return;
    }

    moveDeal.mutate(
      { dealId: activeIdValue, stageId: targetStageId },
      {
        onError: () => {
          setToast("Не удалось переместить сделку. Попробуйте еще раз.");
        },
      }
    );
    resetDragState();
  };

  const handleDragCancel = () => {
    resetDragState();
  };

  const handleQuickAdd = (stageId: string, contact: string) => {
    createDeal.mutate(
      { stageId, contact },
      {
        onError: () => {
          setToast("Не удалось создать сделку. Попробуйте еще раз.");
        },
      }
    );
  };

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof Element)) {
      return false;
    }
    return Boolean(
      target.closest(
        ".amo-card, .amo-column__add, .amo-quick-add, button, a, input, textarea, select, [role='button']"
      )
    );
  };

  const stopDragScroll = () => {
    const state = dragScrollRef.current;
    if (!state.isDragging) {
      return;
    }
    const board = boardRef.current;
    if (board && state.pointerId !== null && board.hasPointerCapture(state.pointerId)) {
      board.releasePointerCapture(state.pointerId);
    }
    if (state.moved) {
      suppressClickRef.current = true;
    }
    state.isDragging = false;
    state.pointerId = null;
    setIsDragScrolling(false);
  };

  const handleBoardPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    if (isInteractiveTarget(event.target)) {
      return;
    }
    const board = boardRef.current;
    if (!board) {
      return;
    }
    suppressClickRef.current = false;
    dragScrollRef.current.isDragging = true;
    dragScrollRef.current.startX = event.clientX;
    dragScrollRef.current.scrollLeft = board.scrollLeft;
    dragScrollRef.current.pointerId = event.pointerId;
    dragScrollRef.current.moved = false;
    board.setPointerCapture(event.pointerId);
    setIsDragScrolling(true);
    event.preventDefault();
  };

  const handleBoardPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = dragScrollRef.current;
    if (!state.isDragging || !boardRef.current) {
      return;
    }
    const deltaX = event.clientX - state.startX;
    if (Math.abs(deltaX) > 3) {
      state.moved = true;
    }
    boardRef.current.scrollLeft = state.scrollLeft - deltaX;
  };

  const handleBoardWheel = (event: WheelEvent<HTMLDivElement>) => {
    const board = boardRef.current;
    if (!board) {
      return;
    }
    const deltaX = event.deltaX;
    const deltaY = event.deltaY;
    const target =
      event.target instanceof Element ? event.target : null;
    const inColumnBody = Boolean(target?.closest(".amo-column__body"));

    if (inColumnBody && !event.shiftKey && Math.abs(deltaY) >= Math.abs(deltaX)) {
      return;
    }

    const isHorizontal = event.shiftKey || Math.abs(deltaX) > Math.abs(deltaY);
    if (!isHorizontal) {
      return;
    }
    const delta = deltaX !== 0 ? deltaX : deltaY;
    board.scrollLeft += delta;
    event.preventDefault();
  };

  const handleBoardClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timeout = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-0 min-w-0 items-center justify-center overflow-auto p-ui-3">
        <EmptyState
          title="Загрузка воронки"
          description="Загружаем этапы и сделки."
          className="max-w-md border-dashed border-ui-border bg-ui-surface-muted/30"
        />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-full min-h-0 min-w-0 items-center justify-center overflow-auto p-ui-3">
        <EmptyState
          title="Не удалось загрузить воронку"
          description="Проверьте соединение и обновите страницу."
          className="max-w-md border-dashed border-ui-danger/25 bg-ui-danger/5"
        />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <div
        className={cn(
          "flex gap-3 h-full min-h-0 overflow-x-auto overflow-y-hidden",
          "min-w-full pb-2 cursor-grab select-none overscroll-contain",
          "scrollbar-thin scrollbar-thumb-slate-300/40 scrollbar-track-transparent",
          isDragScrolling && "cursor-grabbing"
        )}
        ref={boardRef}
        onPointerDown={handleBoardPointerDown}
        onPointerMove={handleBoardPointerMove}
        onPointerUp={stopDragScroll}
        onPointerCancel={stopDragScroll}
        onWheel={handleBoardWheel}
        onClickCapture={handleBoardClickCapture}
      >
        {data.stages.map((stage, index) => {
          const stageDeals = dealsByStage.get(stage.id) ?? [];
          const placeholderHeight = activeRect?.height ?? 52;
          const shouldShowPlaceholder =
            activeDeal && overStageId === stage.id && activeDeal.stageId !== stage.id;

          return (
            <StageColumn
              key={stage.id}
              stage={stage}
              deals={stageDeals}
              index={index}
              onQuickAdd={handleQuickAdd}
              placeholderIndex={shouldShowPlaceholder ? overIndex : null}
              placeholderHeight={shouldShowPlaceholder ? placeholderHeight : null}
            />
          );
        })}
      </div>
      <DragOverlay zIndex={1000}>
        {activeDeal ? (
          <DealCardOverlay
            deal={activeDeal}
            width={activeRect?.width}
            height={activeRect?.height}
          />
        ) : null}
      </DragOverlay>
      {/* Toast Notification */}
      {toast ? (
        <div
          className="fixed right-4 bottom-4 bg-text-primary text-white px-4 py-2 rounded-md text-sm shadow-soft z-50"
          role="status"
        >
          {toast}
        </div>
      ) : null}
    </DndContext>
  );
}

