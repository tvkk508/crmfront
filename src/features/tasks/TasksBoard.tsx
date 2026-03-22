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
import { useMemo, useRef, useState, useCallback } from "react";
import type { MouseEvent, PointerEvent, WheelEvent } from "react";
import type { Task } from "../../api/types";
import { cn } from "../../ui/cn";
import { EmptyState, Skeleton } from "../../ui/kit";
import { TaskCardOverlay } from "./TaskCard";
import {
  useTasksQuery,
  useRescheduleTaskMutation,
} from "./useTasks";
import { TaskColumn } from "./TaskColumn";
import { TaskEditDialog } from "./TaskEditDialog";

const TASK_GROUPS = [
  { id: "overdue", title: "Просроченные", color: "rgb(239, 68, 68)" },
  { id: "today", title: "На сегодня", color: "rgb(249, 115, 22)" },
  { id: "tomorrow", title: "На завтра", color: "rgb(59, 130, 246)" },
  { id: "next_week", title: "На следующую неделю", color: "rgb(34, 197, 94)" },
  { id: "future", title: "На будущее", color: "rgb(148, 163, 184)" },
] as const;

type TaskGroupId = typeof TASK_GROUPS[number]["id"];

export function TasksBoard() {
  const { data, isLoading, isError } = useTasksQuery({ group_by_due: true, status: "open" });
  const rescheduleTask = useRescheduleTaskMutation();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeRect, setActiveRect] = useState<ClientRect | null>(null);
  const [overColumnId, setOverColumnId] = useState<TaskGroupId | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [isDragScrolling, setIsDragScrolling] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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

  const tasksByGroup = useMemo(() => {
    if (!data) return new Map<TaskGroupId, Task[]>();
    const map = new Map<TaskGroupId, Task[]>();
    TASK_GROUPS.forEach((group) => {
      const tasks = data[group.id] || [];
      map.set(group.id, tasks);
    });
    return map;
  }, [data]);

  const activeTask = useMemo(() => {
    if (!activeId || !data) return null;
    const taskId = Number(activeId.replace("task-", ""));
    for (const group of TASK_GROUPS) {
      const task = data[group.id]?.find((t) => t.id === taskId);
      if (task) return task;
    }
    return null;
  }, [activeId, data]);

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const rect = event.active.rect.current?.initial ?? event.active.rect.current?.translated;
    if (rect) {
      setActiveRect(rect);
    }
    dragScrollRef.current.isDragging = true;
    suppressClickRef.current = false;
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    if (!event.over) {
      setOverColumnId(null);
      setOverIndex(null);
      return;
    }

    const overId = event.over.id as string;
    if (overId.startsWith("column-")) {
      const columnId = overId.replace("column-", "") as TaskGroupId;
      setOverColumnId(columnId);
      setOverIndex(null);
    } else {
      setOverColumnId(null);
      setOverIndex(null);
    }
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setActiveRect(null);
    setOverColumnId(null);
    setOverIndex(null);
    dragScrollRef.current.isDragging = false;
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveRect(null);
    setOverColumnId(null);
    setOverIndex(null);
    dragScrollRef.current.isDragging = false;

    if (!over || !active) return;

    const taskId = Number((active.id as string).replace("task-", ""));
    const overId = over.id as string;

    if (overId.startsWith("column-")) {
      const targetGroup = overId.replace("column-", "") as TaskGroupId;
      
      // Определяем режим переноса на основе целевой колонки
      let mode: "tomorrow" | "week" | "month" | null = null;
      if (targetGroup === "tomorrow") {
        mode = "tomorrow";
      } else if (targetGroup === "next_week") {
        mode = "week";
      } else if (targetGroup === "future") {
        mode = "month";
      }

      if (mode) {
        try {
          await rescheduleTask.mutateAsync({ id: taskId, mode });
        } catch (err) {
          console.error("Failed to reschedule task", err);
        }
      }
    }
  };

  const handleBoardPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("[data-task-id]")) return;

    dragScrollRef.current.isDragging = true;
    dragScrollRef.current.startX = event.pageX - (boardRef.current?.offsetLeft ?? 0);
    dragScrollRef.current.scrollLeft = boardRef.current?.scrollLeft ?? 0;
    dragScrollRef.current.pointerId = event.pointerId;
    dragScrollRef.current.moved = false;
    setIsDragScrolling(true);
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handleBoardPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragScrollRef.current.isDragging || dragScrollRef.current.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    const x = event.pageX - (boardRef.current?.offsetLeft ?? 0);
    const walk = (x - dragScrollRef.current.startX) * 2;
    if (boardRef.current) {
      boardRef.current.scrollLeft = dragScrollRef.current.scrollLeft - walk;
    }
    if (Math.abs(walk) > 5) {
      dragScrollRef.current.moved = true;
    }
  };

  const stopDragScroll = () => {
    dragScrollRef.current.isDragging = false;
    dragScrollRef.current.pointerId = null;
    setIsDragScrolling(false);
  };

  const handleBoardWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (event.deltaY !== 0 && boardRef.current) {
      event.preventDefault();
      boardRef.current.scrollLeft += event.deltaY;
    }
  };

  const handleBoardClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (dragScrollRef.current.moved) {
      event.preventDefault();
      event.stopPropagation();
    }
    dragScrollRef.current.moved = false;
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-ui-3">
        <div className="flex min-h-0 flex-1 gap-ui-3 overflow-x-auto overflow-y-hidden pb-ui-2 scrollbar-thin">
          {TASK_GROUPS.map((group, i) => (
            <div
              key={group.id}
              className="flex h-full min-h-0 w-[280px] min-w-[280px] shrink-0 flex-col rounded-ui-lg border border-ui-border bg-ui-surface"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="shrink-0 space-y-ui-2 border-b border-ui-border p-ui-3 pb-ui-2">
                <Skeleton className="h-4 w-3/5" variant="text" />
                <Skeleton className="h-3 w-1/4" variant="text" />
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-ui-2 overflow-hidden p-ui-2">
                <Skeleton className="h-[5.5rem] w-full shrink-0" variant="rectangular" />
                <Skeleton className="h-[5.5rem] w-full shrink-0" variant="rectangular" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-full min-h-0 w-full min-w-0 items-center justify-center p-ui-4">
        <EmptyState
          title="Не удалось загрузить задачи"
          description="Проверьте соединение и попробуйте обновить страницу."
          className="w-full max-w-md"
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
          "flex h-full min-h-0 min-w-0 gap-ui-3 overflow-x-auto overflow-y-hidden overscroll-contain",
          "min-w-full cursor-grab select-none pb-ui-2 scrollbar-thin",
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
        {TASK_GROUPS.map((group, index) => {
          const tasks = tasksByGroup.get(group.id) ?? [];
          const placeholderHeight = activeRect?.height ?? 80;
          const shouldShowPlaceholder =
            activeTask && overColumnId === group.id && activeTask.id;

          return (
            <TaskColumn
              key={group.id}
              id={`column-${group.id}`}
              title={group.title}
              tasks={tasks}
              index={index}
              color={group.color}
              placeholderIndex={shouldShowPlaceholder ? overIndex : null}
              placeholderHeight={shouldShowPlaceholder ? placeholderHeight : null}
              onTaskClick={handleTaskClick}
            />
          );
        })}
      </div>
      <DragOverlay zIndex={1000}>
        {activeTask ? (
          <TaskCardOverlay task={activeTask} width={activeRect?.width} />
        ) : null}
      </DragOverlay>
      <TaskEditDialog
        task={selectedTask}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </DndContext>
  );
}
