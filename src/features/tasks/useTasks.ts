import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTasks,
  fetchTaskTypes,
  createTask,
  updateTask,
  completeTask,
  rescheduleTask,
  deleteTask,
} from "../../api/api";
import type { Task, TaskGroupResponse } from "../../api/types";

export function useTaskTypesQuery() {
  return useQuery({
    queryKey: ["task-types"],
    queryFn: async () => {
      const result = await fetchTaskTypes();
      return result.task_types;
    },
  });
}

export function useTasksQuery(params?: {
  responsible_id?: number;
  status?: "open" | "completed" | "canceled";
  entity_type?: "deal" | "contact" | "company";
  entity_id?: number;
  type_id?: number;
  group_by_due?: boolean;
}) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: async () => {
      const result = await fetchTasks({ ...params, group_by_due: params?.group_by_due ?? true });
      // Проверяем, это группированный ответ или обычный список
      if ("overdue" in result || "today" in result) {
        return result as TaskGroupResponse;
      }
      // Если обычный список, преобразуем в группированный формат
      const tasks = (result as { tasks: Task[] }).tasks;
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
      const startOfNextWeek = new Date(startOfToday);
      startOfNextWeek.setDate(startOfNextWeek.getDate() + 2);
      const endOfNextWeek = new Date(startOfToday);
      endOfNextWeek.setDate(endOfNextWeek.getDate() + 8);

      const overdue: Task[] = [];
      const today: Task[] = [];
      const tomorrow: Task[] = [];
      const next_week: Task[] = [];
      const future: Task[] = [];

      tasks.forEach((task) => {
        const dueAt = new Date(task.due_at);
        if (dueAt < startOfToday) {
          overdue.push(task);
        } else if (dueAt >= startOfToday && dueAt < startOfTomorrow) {
          today.push(task);
        } else if (dueAt >= startOfTomorrow && dueAt < startOfNextWeek) {
          tomorrow.push(task);
        } else if (dueAt >= startOfNextWeek && dueAt < endOfNextWeek) {
          next_week.push(task);
        } else {
          future.push(task);
        }
      });

      return { overdue, today, tomorrow, next_week, future } as TaskGroupResponse;
    },
  });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateTask>[1] }) =>
      updateTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useCompleteTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, resultText }: { id: number; resultText?: string | null }) =>
      completeTask(id, resultText),
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches so they don't overwrite the optimistic update
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      // Optimistically remove the task from every cached task group
      queryClient.setQueriesData<TaskGroupResponse>({ queryKey: ["tasks"] }, (old) => {
        if (!old) return old;
        const remove = (arr: Task[] = []) => arr.filter((t) => t.id !== id);
        return {
          overdue: remove(old.overdue),
          today: remove(old.today),
          tomorrow: remove(old.tomorrow),
          next_week: remove(old.next_week),
          future: remove(old.future),
        };
      });
    },
    onSettled: () => {
      // Always reconcile with server regardless of success or error
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useRescheduleTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, mode }: { id: number; mode: "tomorrow" | "week" | "month" }) =>
      rescheduleTask(id, mode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
