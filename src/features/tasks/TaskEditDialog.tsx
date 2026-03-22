import { useState, useEffect, type ReactNode } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  FieldError,
  FieldLabel,
  FormActions,
  FormField,
  Input,
  ScrollArea,
  Select,
  Separator,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../ui/kit";
import { cn } from "../../ui/cn";
import { useUsersQuery } from "../users/useUsers";
import { useUpdateTaskMutation, useTaskTypesQuery, useCompleteTaskMutation } from "./useTasks";
import type { Task } from "../../api/types";

type TaskEditDialogProps = {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const shellClass =
  "flex max-h-[min(85dvh,40rem)] w-[min(100vw-1.5rem,28rem)] max-w-ui-modal-md flex-col gap-0 overflow-hidden p-0";

function MetaLine({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-ui-1 sm:flex-row sm:items-baseline sm:gap-ui-2">
      <span className="shrink-0 text-ui-caption font-medium text-ui-text-muted">{label}</span>
      <div className="min-w-0 flex-1 text-ui-caption text-ui-text [overflow-wrap:anywhere]">{children}</div>
    </div>
  );
}

export function TaskEditDialog({ task, open, onOpenChange }: TaskEditDialogProps) {
  const {
    data: users,
    isLoading: usersLoading,
    isError: usersError,
  } = useUsersQuery();
  const {
    data: taskTypes,
    isLoading: typesLoading,
    isError: typesError,
  } = useTaskTypesQuery();
  const updateTask = useUpdateTaskMutation();
  const completeTask = useCompleteTaskMutation();

  const [text, setText] = useState(task?.text || "");
  const [responsibleUserId, setResponsibleUserId] = useState<number | null>(
    task?.responsible_user_id || null
  );
  const [taskTypeId, setTaskTypeId] = useState(task?.task_type_id || 0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setText(task.text);
      setResponsibleUserId(task.responsible_user_id);
      setTaskTypeId(task.task_type_id);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateTask.mutateAsync({
        id: task.id,
        payload: {
          text: text.trim(),
          responsible_user_id: responsibleUserId ?? undefined,
          task_type_id: taskTypeId,
        },
      });
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to update task", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    try {
      await completeTask.mutateAsync({ id: task.id });
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to complete task", err);
    }
  };

  const entityTitle = task.entity_title?.trim() ?? "";
  const titleForTooltip = entityTitle.length > 48 ? entityTitle : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(shellClass)}>
        <div className="shrink-0 border-b border-ui-border px-ui-6 pb-ui-4 pt-ui-6">
          <DialogHeader className="mb-0">
            <DialogTitle className="truncate">Редактировать задачу</DialogTitle>
          </DialogHeader>
        </div>

        <ScrollArea orientation="vertical" className="min-h-0 min-w-0 flex-1 px-ui-6 py-ui-4">
          <div className="flex min-w-0 flex-col gap-ui-4">
            <FormField>
              <FieldLabel htmlFor="task-edit-type" required>
                Тип задачи
              </FieldLabel>
              {typesLoading ? (
                <Skeleton className="h-[calc(var(--control-height)-4px)] w-full" variant="rectangular" />
              ) : (
                <Select
                  id="task-edit-type"
                  size="small"
                  className="min-w-0"
                  value={taskTypeId}
                  onChange={(e) => setTaskTypeId(Number(e.target.value))}
                  disabled={isSaving}
                  aria-invalid={typesError || undefined}
                >
                  {taskTypes?.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </Select>
              )}
              {typesError ? <FieldError>Не удалось загрузить типы задач.</FieldError> : null}
            </FormField>

            <FormField>
              <FieldLabel htmlFor="task-edit-text" required>
                Текст задачи
              </FieldLabel>
              <Input
                id="task-edit-text"
                size="small"
                className="min-w-0"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isSaving}
                placeholder="Введите текст задачи"
                aria-required
              />
            </FormField>

            <FormField>
              <FieldLabel htmlFor="task-edit-responsible">Ответственный</FieldLabel>
              {usersLoading ? (
                <Skeleton className="h-[calc(var(--control-height)-4px)] w-full" variant="rectangular" />
              ) : (
                <Select
                  id="task-edit-responsible"
                  size="small"
                  className="min-w-0"
                  value={responsibleUserId ?? ""}
                  onChange={(e) =>
                    setResponsibleUserId(e.target.value ? Number(e.target.value) : null)
                  }
                  disabled={isSaving}
                  aria-invalid={usersError || undefined}
                >
                  <option value="">Не назначен</option>
                  {users?.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </Select>
              )}
              {usersError ? <FieldError>Не удалось загрузить список пользователей.</FieldError> : null}
            </FormField>

            <Separator />

            <div className="flex min-w-0 flex-col gap-ui-2" role="group" aria-label="Сведения о задаче">
              <MetaLine label="Сущность">
                {task.entity_type === "deal" ? "Сделка" : task.entity_type}
              </MetaLine>
              {entityTitle ? (
                <MetaLine label="Название">
                  {titleForTooltip ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="line-clamp-3 cursor-default text-left sm:line-clamp-2">
                          {entityTitle}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="max-w-[min(20rem,calc(100vw-1rem))] break-words"
                      >
                        {titleForTooltip}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    entityTitle
                  )}
                </MetaLine>
              ) : null}
              <MetaLine label="Дедлайн">{new Date(task.due_at).toLocaleString("ru-RU")}</MetaLine>
              {task.priority ? (
                <p className="text-ui-caption font-medium text-ui-warn">Важная задача</p>
              ) : null}
            </div>
          </div>
        </ScrollArea>

        <FormActions className="shrink-0 px-ui-6 pb-ui-6">
          <Button
            type="button"
            variant="secondary"
            size="small"
            className="min-w-0 flex-1 sm:flex-initial"
            onClick={() => onOpenChange(false)}
            disabled={isSaving || completeTask.isPending}
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="small"
            className="min-w-0 flex-1 sm:flex-initial"
            onClick={handleComplete}
            disabled={isSaving || completeTask.isPending}
          >
            {completeTask.isPending ? "..." : "Выполнено"}
          </Button>
          <Button
            type="button"
            size="small"
            className="min-w-0 flex-1 sm:flex-initial"
            onClick={handleSave}
            disabled={isSaving || completeTask.isPending || !text.trim() || typesLoading}
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </Button>
        </FormActions>
      </DialogContent>
    </Dialog>
  );
}
