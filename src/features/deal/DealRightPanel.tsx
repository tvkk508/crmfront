import { useMemo, useState } from "react";
import type { Task } from "../../api/types";
import { Badge, Button, Card, Cluster, EmptyState, ScrollArea } from "../../ui/kit";
import { TaskCreateDialog } from "../tasks/TaskCreateDialog";
import { TaskEditDialog } from "../tasks/TaskEditDialog";
import { useCompleteTaskMutation, useTasksQuery } from "../tasks/useTasks";

type DealRightPanelProps = {
  dealId?: number;
};

const formatDueLabel = (dueAt: string): { label: string; overdue: boolean; today: boolean } => {
  const due = new Date(dueAt);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  if (due < startOfToday) {
    return { label: "Просрочено", overdue: true, today: false };
  }
  if (due < startOfTomorrow) {
    return { label: "Сегодня", overdue: false, today: true };
  }
  return {
    label: due.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }),
    overdue: false,
    today: false,
  };
};

function TaskRow({ task, onClick }: { task: Task; onClick: () => void }) {
  const completeMutation = useCompleteTaskMutation();
  const { label: dueLabel, overdue, today } = formatDueLabel(task.due_at);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="flex min-w-0 cursor-pointer items-center gap-ui-2 rounded-ui-md border border-ui-border/60 bg-ui-surface px-ui-3 py-ui-2.5 transition-colors hover:border-ui-accent/40 hover:bg-ui-surface-muted"
    >
      <div className="min-w-0 flex-1">
        <div
          className="min-w-0 truncate text-[13px] font-medium leading-snug text-ui-text"
          title={task.text}
        >
          {task.text}
        </div>
        <div className="mt-ui-1 flex min-w-0 flex-wrap items-center gap-ui-1.5">
          <Badge
            variant={overdue ? "danger" : today ? "warn" : "neutral"}
            badgeSize="small"
            className="tabular-nums"
          >
            {dueLabel}
          </Badge>
          {task.task_type_name ? (
            <span className="text-ui-caption text-ui-text-muted">{task.task_type_name}</span>
          ) : null}
        </div>
      </div>
      <Button
        type="button"
        size="small"
        variant="secondary"
        disabled={completeMutation.isPending}
        onClick={(e) => {
          e.stopPropagation();
          completeMutation.mutate({ id: task.id });
        }}
        className="shrink-0"
      >
        {completeMutation.isPending ? "..." : "Выполнить"}
      </Button>
    </div>
  );
}

export function DealRightPanel({ dealId }: DealRightPanelProps) {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: tasksData, isLoading: tasksLoading } = useTasksQuery(
    dealId
      ? { entity_type: "deal", entity_id: dealId, status: "open", group_by_due: true }
      : undefined
  );

  const allTasks = useMemo(() => {
    if (!tasksData || !("overdue" in tasksData)) return [];
    const seen = new Set<number>();
    return [
      ...(tasksData.overdue ?? []),
      ...(tasksData.today ?? []),
      ...(tasksData.tomorrow ?? []),
      ...(tasksData.next_week ?? []),
      ...(tasksData.future ?? []),
    ].filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  }, [tasksData]);

  return (
    <div className="flex h-full w-full min-h-0 flex-col rounded-ui-lg border border-ui-border bg-ui-surface">
      {/* Header */}
      <div className="sticky top-0 z-10 shrink-0 border-b border-ui-border bg-ui-surface px-ui-3 py-ui-3 sm:px-ui-4">
        <div className="min-w-0 text-ui-section-title text-ui-text">Виджеты</div>
        <div className="mt-ui-1 text-ui-caption text-ui-text-muted">Задачи и аналитика</div>
      </div>

      <ScrollArea
        orientation="vertical"
        className="min-h-0 flex-1 px-ui-3 pb-ui-6 pt-ui-4 sm:px-ui-4"
      >
        {/* Tasks section */}
        <section className="mb-ui-5">
          <Cluster gap="sm" align="center" justify="between" className="mb-ui-2 min-w-0">
            <div className="flex min-w-0 items-center gap-ui-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-ui-text-muted">
                Задачи
              </span>
              {allTasks.length > 0 ? (
                <Badge variant="accent" badgeSize="small" className="tabular-nums">
                  {allTasks.length}
                </Badge>
              ) : null}
            </div>
            {dealId ? (
              <Button
                type="button"
                size="small"
                variant="secondary"
                onClick={() => setIsTaskDialogOpen(true)}
              >
                + Создать
              </Button>
            ) : null}
          </Cluster>

          {tasksLoading ? (
            <div className="flex min-w-0 flex-col gap-ui-2">
              {[0, 1].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-ui-sm bg-ui-surface-muted" />
              ))}
            </div>
          ) : allTasks.length === 0 ? (
            <EmptyState
              title="Нет активных задач"
              description={
                dealId ? "Нажмите «+ Создать» чтобы добавить задачу" : "Выберите сделку"
              }
              className="border-ui-border/80 bg-ui-surface-muted/80 py-ui-4 shadow-none text-left md:py-ui-4"
            />
          ) : (
            <div className="flex min-w-0 flex-col gap-ui-1.5">
              {allTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onClick={() => {
                    setSelectedTask(task);
                    setIsEditDialogOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Analytics placeholder section */}
        <section>
          <div className="mb-ui-2 text-[10px] font-semibold uppercase tracking-wide text-ui-text-muted">
            Аналитика
          </div>
          <div className="flex min-w-0 flex-col gap-ui-2">
            <Card variant="outlined" className="min-w-0 bg-ui-surface-muted p-ui-3">
              <Cluster gap="sm" align="center" justify="between" className="min-w-0">
                <div className="min-w-0">
                  <div className="text-ui-caption font-medium text-ui-text">Транскрипция</div>
                  <div className="mt-ui-0.5 text-[10px] text-ui-text-muted">
                    Расшифровка звонков
                  </div>
                </div>
                <Badge variant="neutral" badgeSize="small" className="shrink-0">
                  Скоро
                </Badge>
              </Cluster>
            </Card>
            <Card variant="outlined" className="min-w-0 bg-ui-surface-muted p-ui-3">
              <Cluster gap="sm" align="center" justify="between" className="min-w-0">
                <div className="min-w-0">
                  <div className="text-ui-caption font-medium text-ui-text">AI-анализ</div>
                  <div className="mt-ui-0.5 text-[10px] text-ui-text-muted">
                    Анализ разговоров и сделки
                  </div>
                </div>
                <Badge variant="neutral" badgeSize="small" className="shrink-0">
                  Скоро
                </Badge>
              </Cluster>
            </Card>
          </div>
        </section>
      </ScrollArea>

      {dealId ? (
        <TaskCreateDialog
          entityType="deal"
          entityId={dealId}
          open={isTaskDialogOpen}
          onOpenChange={setIsTaskDialogOpen}
        />
      ) : null}
      <TaskEditDialog
        task={selectedTask}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
}
