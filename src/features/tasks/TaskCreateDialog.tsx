import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  FieldError,
  FieldLabel,
  FormActions,
  FormField,
  Input,
  ScrollArea,
  Select,
  Skeleton,
} from "../../ui/kit";
import { cn } from "../../ui/cn";
import { usePublicUsersQuery } from "../users/useUsers";
import { useCreateTaskMutation, useTaskTypesQuery } from "./useTasks";
import { useAuth } from "../../auth/AuthProvider";

type TaskCreateDialogProps = {
  entityType: "deal" | "contact" | "company";
  entityId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const shellClass =
  "flex max-h-[min(85dvh,40rem)] w-[min(100vw-1.5rem,28rem)] max-w-ui-modal-md flex-col gap-0 overflow-hidden p-0";

export function TaskCreateDialog({ entityType, entityId, open, onOpenChange }: TaskCreateDialogProps) {
  const { user } = useAuth();
  const {
    data: users,
    isLoading: usersLoading,
    isError: usersError,
  } = usePublicUsersQuery();
  const {
    data: taskTypes,
    isLoading: typesLoading,
    isError: typesError,
  } = useTaskTypesQuery();
  const createTask = useCreateTaskMutation();

  const [text, setText] = useState("");
  const [responsibleUserId, setResponsibleUserId] = useState<number | null>(user?.id ?? null);
  const [taskTypeId, setTaskTypeId] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (taskTypes && taskTypes.length > 0 && taskTypeId === 0) {
      setTaskTypeId(taskTypes[0].id);
    }
  }, [taskTypes, taskTypeId]);

  const handleSave = async () => {
    if (!text.trim() || !taskTypeId || !responsibleUserId) {
      return;
    }

    let dueAt: Date;
    if (dueDate && dueTime) {
      dueAt = new Date(`${dueDate}T${dueTime}`);
    } else if (dueDate) {
      dueAt = new Date(`${dueDate}T12:00`);
    } else {
      dueAt = new Date();
      dueAt.setDate(dueAt.getDate() + 1);
      dueAt.setHours(12, 0, 0, 0);
    }

    setIsSaving(true);
    try {
      await createTask.mutateAsync({
        task_type_id: taskTypeId,
        responsible_user_id: responsibleUserId,
        entity_type: entityType,
        entity_id: entityId,
        text: text.trim(),
        due_at: dueAt,
      });
      setText("");
      setDueDate("");
      setDueTime("");
      setResponsibleUserId(user?.id ?? null);
      if (taskTypes && taskTypes.length > 0) {
        setTaskTypeId(taskTypes[0].id);
      }
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to create task", err);
    } finally {
      setIsSaving(false);
    }
  };

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const noTaskTypes = !typesLoading && !typesError && (!taskTypes || taskTypes.length === 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(shellClass)}>
        <div className="shrink-0 border-b border-ui-border px-ui-6 pb-ui-4 pt-ui-6">
          <DialogHeader className="mb-0">
            <DialogTitle>Создать задачу</DialogTitle>
            <DialogDescription>
              Укажите тип, текст и ответственного. Дата и время дедлайна можно не задавать — по умолчанию
              будет завтра в 12:00.
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea orientation="vertical" className="min-h-0 min-w-0 flex-1 px-ui-6 py-ui-4">
          <div className="flex min-w-0 flex-col gap-ui-4">
            <FormField>
              <FieldLabel htmlFor="task-create-type" required>
                Тип задачи
              </FieldLabel>
              {typesLoading ? (
                <Skeleton className="h-[calc(var(--control-height)-4px)] w-full" variant="rectangular" />
              ) : (
                <Select
                  id="task-create-type"
                  size="small"
                  className="min-w-0"
                  value={taskTypeId}
                  onChange={(e) => setTaskTypeId(Number(e.target.value))}
                  disabled={isSaving || noTaskTypes}
                  aria-busy={typesLoading || undefined}
                  aria-invalid={typesError || noTaskTypes || undefined}
                >
                  {taskTypes?.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </Select>
              )}
              {typesError ? <FieldError>Не удалось загрузить типы задач.</FieldError> : null}
              {noTaskTypes ? (
                <p
                  role="status"
                  className="rounded-ui-md border border-dashed border-ui-border bg-ui-surface-muted px-ui-3 py-ui-2 text-ui-caption text-ui-text-muted"
                >
                  Нет доступных типов задач.
                </p>
              ) : null}
            </FormField>

            <FormField>
              <FieldLabel htmlFor="task-create-text" required>
                Текст задачи
              </FieldLabel>
              <Input
                id="task-create-text"
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
              <FieldLabel htmlFor="task-create-responsible" required>
                Ответственный
              </FieldLabel>
              {usersLoading ? (
                <Skeleton className="h-[calc(var(--control-height)-4px)] w-full" variant="rectangular" />
              ) : (
                <Select
                  id="task-create-responsible"
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

            <FormField>
              <FieldLabel htmlFor="task-create-due-date">Дата дедлайна</FieldLabel>
              <Input
                id="task-create-due-date"
                type="date"
                size="small"
                className="min-w-0"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isSaving}
                min={today}
              />
              <p className="text-ui-caption text-ui-text-muted">Необязательно</p>
            </FormField>

            <FormField>
              <FieldLabel htmlFor="task-create-due-time">Время дедлайна</FieldLabel>
              <Input
                id="task-create-due-time"
                type="time"
                size="small"
                className="min-w-0"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                disabled={isSaving}
              />
              <p className="text-ui-caption text-ui-text-muted">Учитывается, если задана дата</p>
            </FormField>
          </div>
        </ScrollArea>

        <FormActions className="shrink-0 px-ui-6 pb-ui-6">
          <Button
            type="button"
            variant="secondary"
            size="small"
            className="min-w-0 flex-1 sm:flex-initial"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Отмена
          </Button>
          <Button
            type="button"
            size="small"
            className="min-w-0 flex-1 sm:flex-initial"
            onClick={handleSave}
            disabled={
              isSaving || !text.trim() || !taskTypeId || !responsibleUserId || typesLoading || noTaskTypes
            }
          >
            {isSaving ? "Создание..." : "Создать"}
          </Button>
        </FormActions>
      </DialogContent>
    </Dialog>
  );
}
