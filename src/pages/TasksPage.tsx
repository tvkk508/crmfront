import { TasksBoard } from "../features/tasks/TasksBoard";
import { Toolbar } from "../ui/kit";

export function TasksPage() {
  return (
    <div
      className="page-enter flex h-full min-h-0 w-full min-w-0 flex-col bg-ui-background"
      data-testid="tasks-page"
    >
      <header className="sticky top-0 z-10 shrink-0 border-b border-ui-border bg-ui-surface px-ui-3 py-ui-3 sm:px-ui-4">
        <Toolbar className="flex-col items-stretch gap-ui-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-ui-section-title text-text-primary">Задачи</h1>
            <p className="mt-ui-1 text-ui-caption text-text-tertiary">
              Управление задачами по срокам выполнения
            </p>
          </div>
        </Toolbar>
      </header>
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden p-ui-3 sm:p-ui-4">
        <TasksBoard />
      </div>
    </div>
  );
}
