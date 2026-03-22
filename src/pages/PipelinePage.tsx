import { useState } from "react";
import { PipelineBoard } from "../features/pipeline/PipelineBoard";
import { formatRubles } from "../features/pipeline/format";
import { usePipelineQuery } from "../features/pipeline/usePipeline";
import {
  Button,
  Cluster,
  FieldLabel,
  FormActions,
  FormField,
  Input,
  Select,
  Toolbar,
} from "../ui/kit";
import { useAuth } from "../auth/AuthProvider";
import { useUsersQuery } from "../features/users/useUsers";

export function PipelinePage() {
  const { user } = useAuth();
  const { data: users } = useUsersQuery({ enabled: user?.role === "admin" });
  const [search, setSearch] = useState("");
  const [responsibleFilter, setResponsibleFilter] = useState("all");
  const responsibleUserId =
    responsibleFilter === "all" ? undefined : Number(responsibleFilter);

  const filters = {
    responsibleUserId,
    q: search.trim() ? search.trim() : undefined,
  };
  const { data } = usePipelineQuery(filters);
  const totalDeals = data?.deals.length ?? 0;
  const totalValue =
    data?.deals.reduce((sum, deal) => sum + deal.value, 0) ?? 0;

  return (
    <div
      className="page-enter flex h-full min-h-0 w-full min-w-0 max-w-none flex-col bg-ui-background"
      data-testid="pipeline-page"
    >
      <header
        className="sticky top-0 z-10 shrink-0 border-b border-ui-border bg-ui-surface px-ui-3 py-ui-3 sm:px-ui-4"
        data-testid="pipeline-topbar"
      >
        <Toolbar className="flex-col items-stretch gap-y-ui-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-ui-3 lg:flex-row lg:items-center lg:gap-ui-4">
            <h1
              className="shrink-0 text-ui-section-title text-text-primary"
              data-testid="pipeline-title"
            >
              Воронка
            </h1>
            <FormField className="min-w-0 flex-1 lg:max-w-md">
              <FieldLabel htmlFor="pipeline-search" className="sr-only">
                Поиск и фильтр
              </FieldLabel>
              <div className="relative min-w-0">
                <svg
                  className="pointer-events-none absolute left-ui-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <Input
                  id="pipeline-search"
                  className="w-full pl-9"
                  placeholder="Поиск и фильтр"
                  aria-label="Поиск и фильтр"
                  type="search"
                  size="small"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </FormField>
          </div>

          <Cluster
            gap="md"
            align="center"
            justify="end"
            className="w-full min-w-0 sm:w-auto sm:flex-1 sm:justify-end lg:flex-none"
          >
            {user?.role === "admin" ? (
              <FormField className="min-w-0 w-full shrink-0 sm:w-[min(100%,14rem)]">
                <FieldLabel htmlFor="pipeline-responsible">Ответственный</FieldLabel>
                <Select
                  id="pipeline-responsible"
                  size="small"
                  value={responsibleFilter}
                  onChange={(event) => setResponsibleFilter(event.target.value)}
                  aria-label="Фильтр по ответственному"
                >
                  <option value="all">Все ответственные</option>
                  {(users ?? []).map((item) => (
                    <option key={item.id} value={String(item.id)}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </FormField>
            ) : null}

            <div className="flex min-w-0 flex-col items-stretch gap-0.5 text-ui-caption sm:items-end">
              <span className="text-text-secondary">
                <span className="font-semibold text-text-primary">{totalDeals}</span>{" "}
                сделок
              </span>
              <span className="font-medium tabular-nums text-text-tertiary">
                {formatRubles(totalValue)}
              </span>
            </div>

            <FormActions variant="plain" className="mt-0 w-full min-w-0 pt-0 sm:w-auto">
              <Button variant="secondary" size="small" className="min-w-0 flex-1 sm:flex-none">
                Настроить воронку
              </Button>
              <Button variant="primary" size="small" className="min-w-0 flex-1 sm:flex-none">
                + Новая сделка
              </Button>
            </FormActions>
          </Cluster>
        </Toolbar>
      </header>

      <div className="min-h-0 min-w-0 flex-1 overflow-hidden p-ui-3 sm:p-ui-4">
        <PipelineBoard filters={filters} />
      </div>
    </div>
  );
}
