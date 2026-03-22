import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { memo, useMemo } from "react";
import type { CSSProperties } from "react";
import { Fragment } from "react";
import type { Task } from "../../api/types";
import { cn } from "../../ui/cn";
import { EmptyState } from "../../ui/kit";
import { TaskCard } from "./TaskCard";

type TaskColumnProps = {
  title: string;
  tasks: Task[];
  id: string;
  index: number;
  color?: string;
  placeholderIndex?: number | null;
  placeholderHeight?: number | null;
  onTaskClick?: (task: Task) => void;
};

export const TaskColumn = memo(function TaskColumn({
  title,
  tasks,
  id,
  index,
  color,
  placeholderIndex,
  placeholderHeight,
  onTaskClick,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const columnStyle = useMemo(
    () =>
      ({
        "--column-color": color || "rgb(var(--ui-color-accent))",
      }) as CSSProperties,
    [color]
  );

  const showPlaceholder = typeof placeholderIndex === "number";
  const placeholderStyle = useMemo(
    () => (placeholderHeight ? { height: placeholderHeight } : undefined),
    [placeholderHeight]
  );

  const taskIds = useMemo(() => tasks.map((t) => `task-${t.id}`), [tasks]);

  const renderPlaceholder = (key: string) => (
    <div
      key={key}
      className="box-border min-h-[80px] w-full rounded-ui-sm border border-dashed border-ui-accent/35 bg-ui-accent/[0.06]"
      style={placeholderStyle}
    />
  );

  return (
    <div
      style={{ animationDelay: `${index * 40}ms`, ...columnStyle }}
      className={cn(
        "relative flex h-full min-h-0 w-[280px] min-w-[280px] flex-col",
        "rounded-ui-lg border border-ui-border bg-ui-surface transition-colors duration-ui-base motion-reduce:transition-none",
        "before:absolute before:-left-px before:-right-px before:-top-px before:h-[3px] before:rounded-t-ui-lg before:bg-[var(--column-color)] before:content-['']",
        isOver && "border-ui-accent/50 bg-ui-accent/[0.08]"
      )}
    >
      <div className="flex shrink-0 items-start justify-between gap-ui-2 border-b border-ui-border p-ui-3 pb-ui-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-ui-caption font-bold uppercase tracking-wide text-text-primary">
            {title}
          </h3>
          <p className="mt-ui-1 text-ui-caption tabular-nums text-text-tertiary">
            {tasks.length}{" "}
            {tasks.length === 1 ? "задача" : tasks.length < 5 ? "задачи" : "задач"}
          </p>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex min-h-0 min-w-0 flex-1 flex-col gap-ui-2 overflow-y-auto overflow-x-hidden overscroll-contain p-ui-2 scrollbar-thin"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <EmptyState
              title="Нет задач"
              description="Задачи появятся здесь"
              className="border-ui-border/80 bg-ui-surface-muted/80 py-ui-6 shadow-none md:py-ui-6"
            />
          ) : (
            tasks.map((task, taskIndex) => {
              if (showPlaceholder && taskIndex === placeholderIndex) {
                return (
                  <Fragment key={`placeholder-${task.id}`}>
                    {renderPlaceholder(`placeholder-before-${task.id}`)}
                    <TaskCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} />
                  </Fragment>
                );
              }
              return <TaskCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} />;
            })
          )}
        </SortableContext>
      </div>
    </div>
  );
});
