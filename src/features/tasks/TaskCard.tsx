/**
 * TaskCard — Task card with drag-and-drop and completion support.
 *
 * Phase 1 Update: Enhanced with new design tokens for better visual hierarchy,
 * improved interactive states, and consistent spacing.
 */
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import type { Task } from "../../api/types";
import { cn } from "../../ui/cn";
import { Badge, Tag, Tooltip, TooltipContent, TooltipTrigger } from "../../ui/kit";
import { useCompleteTaskMutation } from "./useTasks";

const formatTimeUntilDue = (dueAt: Date): string => {
  const now = new Date();
  const diff = dueAt.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (diff < 0) {
    return "просрочено";
  }
  if (days > 0) {
    return `через ${days} ${days === 1 ? "день" : days < 5 ? "дня" : "дней"}`;
  }
  if (hours > 0) {
    return `через ${hours} ${hours === 1 ? "час" : hours < 5 ? "часа" : "часов"}`;
  }
  if (minutes > 0) {
    return `через ${minutes} ${minutes === 1 ? "минуту" : minutes < 5 ? "минуты" : "минут"}`;
  }
  return "сейчас";
};

const ENTITY_ICON: Record<string, string> = {
  deal: "📋",
  contact: "👤",
  company: "🏢",
};

type TaskCardProps = {
  task: Task;
  onClick?: () => void;
};

const TOOLTIP_TEXT_LEN = 72;
const TOOLTIP_ENTITY_LEN = 56;

function TaskTextBlock({ text }: { text: string }) {
  const body = (
    <span className="min-w-0 flex-1 text-left text-ui-body-sm font-medium text-ui-text line-clamp-2 [overflow-wrap:anywhere]">
      {text}
    </span>
  );
  if (text.length <= TOOLTIP_TEXT_LEN) {
    return body;
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>{body}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-[min(20rem,calc(100vw-1rem))] break-words">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

function EntityLine({ task }: { task: Task }) {
  if (!task.entity_title) return null;
  const icon = ENTITY_ICON[task.entity_type] ?? "";
  const full = `${icon ? `${icon} ` : ""}${task.entity_title}`.trim();
  const isDeal = task.entity_type === "deal" && Boolean(task.entity_id);
  const isLong = task.entity_title.length > TOOLTIP_ENTITY_LEN;

  const innerContent = (
    <>
      {icon ? <span aria-hidden>{icon}</span> : null}
      {icon ? " " : null}
      {task.entity_title}
    </>
  );

  if (isDeal && !isLong) {
    return (
      <Link
        to={`/deal/${task.entity_id}`}
        onClick={(e) => e.stopPropagation()}
        className="min-w-0 truncate text-ui-caption text-ui-accent font-medium hover:underline focus-visible:outline-none focus-visible:underline active:opacity-70"
      >
        {innerContent}
      </Link>
    );
  }

  if (isDeal && isLong) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={`/deal/${task.entity_id}`}
            onClick={(e) => e.stopPropagation()}
            className="min-w-0 truncate text-ui-caption text-ui-accent font-medium hover:underline focus-visible:outline-none focus-visible:underline active:opacity-70"
          >
            {innerContent}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[min(20rem,calc(100vw-1rem))] break-words">
          {full}
        </TooltipContent>
      </Tooltip>
    );
  }

  if (!isLong) {
    return (
      <div className="min-w-0 truncate text-ui-caption text-ui-text-tertiary" title={task.entity_title}>
        {innerContent}
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="min-w-0 cursor-default truncate text-ui-caption text-ui-text-tertiary">
          {innerContent}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[min(20rem,calc(100vw-1rem))] break-words">
        {full}
      </TooltipContent>
    </Tooltip>
  );
}

export const TaskCard = memo(function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `task-${task.id}`,
  });
  const completeMutation = useCompleteTaskMutation();

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition: isDragging ? "none" : transition,
      opacity: isDragging ? 0.4 : 1,
    }),
    [transform, transition, isDragging]
  );

  const { isOverdue, timeUntilDue } = useMemo(() => {
    const due = new Date(task.due_at);
    const now = new Date();
    const isOver = due < now && task.status === "open";
    const timeStr = formatTimeUntilDue(due);
    return { isOverdue: isOver, timeUntilDue: timeStr };
  }, [task.due_at, task.status]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-task-id={task.id}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        // Base styles
        "group relative flex min-h-[80px] min-w-0 cursor-pointer flex-col gap-ui-2",
        "rounded-ui-lg border border-ui-border-muted bg-ui-surface p-card-padding-sm",
        "transition-all duration-ui-fast ease-ui-ease will-change-transform",
        
        // Hover state
        "hover:border-ui-accent/30 hover:shadow-ui-card-hover",
        
        // Overdue state
        isOverdue && [
          "border-ui-danger/40",
          "bg-ui-danger-muted/40",
        ],
        
        // Priority state
        task.priority && !isOverdue && [
          "border-ui-warn/40",
          "bg-ui-warn-muted/40",
        ]
      )}
    >
      {/* Priority badge */}
      {task.priority && (
        <div className="absolute right-ui-2 top-ui-2">
          <Badge variant="warn" badgeSize="small" className="max-w-[5rem] truncate">
            Важно
          </Badge>
        </div>
      )}

      {/* Task text */}
      <div className="flex min-w-0 items-start gap-ui-2 pr-10">
        <TaskTextBlock text={task.text} />
      </div>

      {/* Task type tag */}
      {task.task_type_name && (
        <div className="flex min-w-0 items-center gap-ui-1.5">
          <Tag variant="neutral" size="small" className="max-w-full min-w-0 truncate font-medium">
            {task.task_type_name}
          </Tag>
        </div>
      )}

      {/* Entity link */}
      <EntityLine task={task} />

      {/* Footer: Due time + Actions */}
      <div className="mt-auto flex min-w-0 items-center justify-between gap-ui-2">
        <span
          className={cn(
            "shrink-0 text-ui-overline tabular-nums text-ui-text-tertiary",
            isOverdue && "font-semibold text-ui-danger"
          )}
        >
          {timeUntilDue}
        </span>
        <div className="flex shrink-0 items-center gap-ui-1.5">
          {task.source === "automation" && (
            <Tag variant="neutral" size="small" title="Автоматизация">
              Авто
            </Tag>
          )}
          <button
            type="button"
            title="Выполнить задачу"
            disabled={completeMutation.isPending}
            onClick={(e) => {
              e.stopPropagation();
              completeMutation.mutate({ id: task.id });
            }}
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full",
              "border border-ui-border-muted",
              "text-ui-text-muted",
              "transition-all duration-ui-fast ease-ui-ease",
              
              // Hover state
              "hover:border-ui-success hover:bg-ui-success-muted hover:text-ui-success hover:scale-110",
              
              // Focus state
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-success/30",
              
              // Disabled state
              "disabled:cursor-not-allowed disabled:opacity-ui-disabled",
              
              // Loading/pending state
              completeMutation.isPending && "border-ui-success bg-ui-success-muted text-ui-success"
            )}
          >
            <svg
              className="h-3 w-3"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M2 6l3 3 5-5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

export function TaskCardOverlay({ task, width }: { task: Task; width?: number }) {
  const dueDate = new Date(task.due_at);
  const isOverdue = dueDate < new Date() && task.status === "open";
  const timeUntilDue = formatTimeUntilDue(dueDate);

  return (
    <div
      className={cn(
        "relative flex min-h-[80px] min-w-0 flex-col gap-ui-2",
        "rounded-ui-lg border border-ui-border-muted bg-ui-surface p-card-padding-sm",
        "shadow-ui-lg",
        isOverdue && "border-ui-danger/40 bg-ui-danger-muted/40",
        task.priority && !isOverdue && "border-ui-warn/40 bg-ui-warn-muted/40"
      )}
      style={{ width }}
    >
      {task.priority && (
        <div className="absolute right-ui-2 top-ui-2">
          <Badge variant="warn" badgeSize="small" className="max-w-[5rem] truncate">
            Важно
          </Badge>
        </div>
      )}
      <span className="min-w-0 pr-10 text-ui-body-sm font-medium text-ui-text line-clamp-2 [overflow-wrap:anywhere]">
        {task.text}
      </span>
      {task.task_type_name && (
        <Tag variant="neutral" size="small" className="w-fit max-w-full truncate font-medium">
          {task.task_type_name}
        </Tag>
      )}
      {task.entity_title && (
        <div className="min-w-0 truncate text-ui-caption text-ui-text-tertiary">
          {ENTITY_ICON[task.entity_type] && (
            <span aria-hidden>{ENTITY_ICON[task.entity_type]}</span>
          )}
          {ENTITY_ICON[task.entity_type] ? " " : null}
          {task.entity_title}
        </div>
      )}
      <span
        className={cn(
          "text-ui-overline tabular-nums text-ui-text-tertiary",
          isOverdue && "font-semibold text-ui-danger"
        )}
      >
        {timeUntilDue}
      </span>
    </div>
  );
}
