import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "../ui/cn";
import { Badge, Button, Skeleton } from "../ui/kit";
import { fetchManagerStats, fetchTransportAnalytics } from "../api/api";
import { useTasksQuery } from "../features/tasks/useTasks";
import { formatRubles } from "../features/pipeline/format";
import type { TransportBucket } from "../api/types";

// ─── Period helpers ────────────────────────────────────────────────────────────

type PeriodPreset = "today" | "week" | "month";

function getDateRange(preset: PeriodPreset): {
  dateFrom: string;
  dateTo: string;
  bucket: TransportBucket;
} {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const to = fmt(now);
  if (preset === "today") return { dateFrom: to, dateTo: to, bucket: "day" };
  if (preset === "week") {
    const from = new Date(now);
    from.setDate(from.getDate() - 6);
    return { dateFrom: fmt(from), dateTo: to, bucket: "day" };
  }
  const from = new Date(now);
  from.setDate(from.getDate() - 29);
  return { dateFrom: fmt(from), dateTo: to, bucket: "week" };
}

// ─── Small shared components ───────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-ui-3 text-[10px] font-semibold uppercase tracking-widest text-ui-text-muted">
      {children}
    </div>
  );
}

function PeriodBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[5px] px-ui-3 py-1 text-[12px] font-medium transition-colors duration-ui-fast",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-accent/40",
        active
          ? "bg-ui-surface shadow-sm text-ui-text"
          : "text-ui-text-muted hover:text-ui-text"
      )}
    >
      {label}
    </button>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

type KpiAccent = "default" | "success" | "danger" | "warn" | "accent";

function KpiCard({
  label,
  value,
  sub,
  accent = "default",
  loading,
  icon,
  delta,
}: {
  label: string;
  value: string | number | null | undefined;
  sub?: string;
  accent?: KpiAccent;
  loading?: boolean;
  icon?: React.ReactNode;
  delta?: { dir: "up" | "down"; label: string } | null;
}) {
  const valueClass: Record<KpiAccent, string> = {
    default: "text-ui-text",
    success: "text-ui-success",
    danger: "text-ui-danger",
    warn: "text-ui-warn",
    accent: "text-ui-accent",
  };

  return (
    <div className="flex min-w-0 flex-col gap-ui-3 rounded-ui-lg border border-ui-border bg-ui-surface p-ui-4 shadow-sm">
      <div className="flex min-w-0 items-center justify-between gap-ui-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-ui-text-muted truncate">
          {label}
        </span>
        {icon ? <span className="shrink-0 text-ui-text-muted opacity-60">{icon}</span> : null}
      </div>

      {loading ? (
        <Skeleton className="h-8 w-2/3" variant="text" />
      ) : (
        <div
          className={cn(
            "text-[26px] font-bold leading-none tabular-nums tracking-tight",
            valueClass[accent]
          )}
        >
          {value ?? "—"}
        </div>
      )}

      <div className="flex min-w-0 items-center gap-ui-1.5">
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              delta.dir === "up"
                ? "bg-ui-success/10 text-ui-success"
                : "bg-ui-danger/10 text-ui-danger"
            )}
          >
            {delta.dir === "up" ? "↑" : "↓"} {delta.label}
          </span>
        ) : null}
        {sub ? (
          <span className="min-w-0 truncate text-[11px] text-ui-text-muted">{sub}</span>
        ) : null}
      </div>
    </div>
  );
}

// ─── Task bar row ──────────────────────────────────────────────────────────────

function TaskBar({
  label,
  count,
  total,
  variant,
}: {
  label: string;
  count: number;
  total: number;
  variant: "danger" | "warn" | "accent" | "muted";
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const barClass = {
    danger: "bg-ui-danger",
    warn: "bg-ui-warn",
    accent: "bg-ui-accent",
    muted: "bg-ui-border",
  }[variant];

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <div className="flex min-w-0 items-center justify-between gap-ui-2">
        <span className="text-[11px] text-ui-text-muted">{label}</span>
        <span className="tabular-nums text-[11px] font-semibold text-ui-text">{count}</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-ui-surface-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Card shell (widget card) ─────────────────────────────────────────────────

function WidgetCard({
  title,
  badge,
  children,
  className,
}: {
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col rounded-ui-lg border border-ui-border bg-ui-surface shadow-sm",
        className
      )}
    >
      <div className="shrink-0 border-b border-ui-border px-ui-4 py-ui-3">
        <div className="flex min-w-0 items-center justify-between gap-ui-2">
          <span className="text-[13px] font-semibold text-ui-text">{title}</span>
          {badge}
        </div>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

const PERIOD_LABELS: Record<PeriodPreset, string> = {
  today: "Сегодня",
  week: "Неделя",
  month: "Месяц",
};

export function DashboardPage() {
  const [period, setPeriod] = useState<PeriodPreset>("month");
  const dateRange = useMemo(() => getDateRange(period), [period]);

  // Real data: manager stats (current state, not period-filtered)
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["manager-stats-dashboard"],
    queryFn: async () => {
      const result = await fetchManagerStats();
      return result.stats;
    },
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  // Real data: open tasks
  const { data: tasksData, isLoading: tasksLoading } = useTasksQuery({
    status: "open",
    group_by_due: true,
  });

  // Real data: transport analytics (period-filtered)
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["transport-analytics-dash", dateRange],
    queryFn: () =>
      fetchTransportAnalytics({
        dateFrom: dateRange.dateFrom,
        dateTo: dateRange.dateTo,
        datePreset: null,
        bucket: dateRange.bucket,
      }),
    retry: 1,
    staleTime: 60_000,
  });

  const taskMetrics = useMemo(() => {
    if (!tasksData) return null;
    const overdue = tasksData.overdue?.length ?? 0;
    const today = tasksData.today?.length ?? 0;
    const tomorrow = tasksData.tomorrow?.length ?? 0;
    const nextWeek = tasksData.next_week?.length ?? 0;
    const future = tasksData.future?.length ?? 0;
    return {
      overdue,
      today,
      tomorrow,
      nextWeek,
      future,
      total: overdue + today + tomorrow + nextWeek + future,
    };
  }, [tasksData]);

  const analyticsDeltas = analytics?.deltas ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-ui-background">
      {/* ── Sticky header ── */}
      <div className="shrink-0 border-b border-ui-border bg-ui-surface px-ui-4 py-ui-3 sm:px-ui-6">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-ui-3">
          <div>
            <h1 className="text-[15px] font-semibold text-ui-text">Dashboard</h1>
            <p className="text-[11px] text-ui-text-muted">Аналитика и ключевые показатели CRM</p>
          </div>
          <div className="flex min-w-0 items-center gap-ui-2">
            <div className="flex items-center gap-0.5 rounded-ui-md border border-ui-border bg-ui-surface-muted p-0.5">
              {(["today", "week", "month"] as PeriodPreset[]).map((p) => (
                <PeriodBtn
                  key={p}
                  label={PERIOD_LABELS[p]}
                  active={period === p}
                  onClick={() => setPeriod(p)}
                />
              ))}
            </div>
            <Button type="button" size="small" variant="secondary" disabled>
              Настроить
            </Button>
          </div>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="min-h-0 flex-1 overflow-y-auto p-ui-4 sm:p-ui-6">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-ui-6">

          {/* === Block 1: Current state KPIs (real data) === */}
          <section>
            <SectionLabel>Текущее состояние</SectionLabel>
            <div className="grid grid-cols-2 gap-ui-3 sm:grid-cols-4">
              <KpiCard
                label="Машин в пути"
                value={stats?.cars_in_transit}
                sub="Активные рейсы"
                accent="accent"
                loading={statsLoading}
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M1 3h15v13H1z" />
                    <path d="M16 8h4l3 3v5h-7V8z" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                }
              />
              <KpiCard
                label="Сделок в воронке"
                value={stats?.total_deals}
                sub="Всего активных"
                loading={statsLoading}
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="5" height="16" rx="1.5" fill="currentColor" opacity=".25" />
                    <rect x="9.5" y="8" width="5" height="12" rx="1.5" fill="currentColor" opacity=".55" />
                    <rect x="16" y="11" width="5" height="9" rx="1.5" fill="currentColor" opacity=".9" />
                  </svg>
                }
              />
              <KpiCard
                label="Денег едет"
                value={stats ? formatRubles(stats.money_in_transit) : null}
                sub="В активных рейсах"
                accent="warn"
                loading={statsLoading}
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v1m0 10v1M9 8.5a3 3 0 0 1 6 0c0 3-6 3-6 7a3 3 0 0 0 6 0" />
                  </svg>
                }
              />
              <KpiCard
                label="Заработано"
                value={stats ? formatRubles(stats.money_earned) : null}
                sub="Завершённые рейсы"
                accent="success"
                loading={statsLoading}
                icon={
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                    <polyline points="16 7 22 7 22 13" />
                  </svg>
                }
              />
            </div>
          </section>

          {/* === Block 2: Transport analytics (period-filtered, real data) === */}
          <section>
            <SectionLabel>
              Транспортная аналитика · {PERIOD_LABELS[period].toLowerCase()}
            </SectionLabel>
            <div className="grid grid-cols-2 gap-ui-3 sm:grid-cols-4">
              <KpiCard
                label="Рейсов"
                value={analytics?.metrics.total_trips ?? null}
                sub="Перевозок за период"
                loading={analyticsLoading}
                delta={
                  analyticsDeltas?.total_trips != null
                    ? {
                        dir: analyticsDeltas.total_trips >= 0 ? "up" : "down",
                        label: `${Math.abs(Math.round(analyticsDeltas.total_trips))}%`,
                      }
                    : null
                }
              />
              <KpiCard
                label="Выручка"
                value={analytics ? formatRubles(analytics.metrics.total_revenue) : null}
                sub="За выбранный период"
                accent="accent"
                loading={analyticsLoading}
                delta={
                  analyticsDeltas?.total_revenue != null
                    ? {
                        dir: analyticsDeltas.total_revenue >= 0 ? "up" : "down",
                        label: `${Math.abs(Math.round(analyticsDeltas.total_revenue))}%`,
                      }
                    : null
                }
              />
              <KpiCard
                label="Средняя ставка"
                value={analytics ? formatRubles(analytics.metrics.avg_rate) : null}
                sub="На перевозку"
                loading={analyticsLoading}
                delta={
                  analyticsDeltas?.avg_rate != null
                    ? {
                        dir: analyticsDeltas.avg_rate >= 0 ? "up" : "down",
                        label: `${Math.abs(Math.round(analyticsDeltas.avg_rate))}%`,
                      }
                    : null
                }
              />
              <KpiCard
                label="Маршрутов"
                value={analytics?.metrics.unique_routes ?? null}
                sub="Уникальных направлений"
                loading={analyticsLoading}
              />
            </div>
          </section>

          {/* === Block 3: Three-column widgets === */}
          <div className="grid grid-cols-1 gap-ui-4 md:grid-cols-2 lg:grid-cols-3">

            {/* Tasks widget — real data */}
            <WidgetCard
              title="Задачи"
              badge={
                !tasksLoading && taskMetrics ? (
                  <Badge
                    variant={taskMetrics.overdue > 0 ? "danger" : "accent"}
                    badgeSize="small"
                    className="tabular-nums"
                  >
                    {taskMetrics.total}
                  </Badge>
                ) : null
              }
            >
              <div className="flex min-w-0 flex-col gap-ui-3 p-ui-4">
                {tasksLoading ? (
                  <>
                    <Skeleton className="h-4 w-full" variant="rectangular" />
                    <Skeleton className="h-4 w-full" variant="rectangular" />
                    <Skeleton className="h-4 w-full" variant="rectangular" />
                    <Skeleton className="h-4 w-4/5" variant="rectangular" />
                  </>
                ) : taskMetrics ? (
                  <>
                    {taskMetrics.total === 0 ? (
                      <div className="py-ui-4 text-center text-[12px] text-ui-text-muted">
                        Нет активных задач
                      </div>
                    ) : (
                      <div className="flex min-w-0 flex-col gap-ui-2">
                        <TaskBar
                          label="Просрочено"
                          count={taskMetrics.overdue}
                          total={taskMetrics.total}
                          variant="danger"
                        />
                        <TaskBar
                          label="На сегодня"
                          count={taskMetrics.today}
                          total={taskMetrics.total}
                          variant="warn"
                        />
                        <TaskBar
                          label="На завтра"
                          count={taskMetrics.tomorrow}
                          total={taskMetrics.total}
                          variant="accent"
                        />
                        <TaskBar
                          label="Следующая неделя"
                          count={taskMetrics.nextWeek}
                          total={taskMetrics.total}
                          variant="muted"
                        />
                        <TaskBar
                          label="Будущие"
                          count={taskMetrics.future}
                          total={taskMetrics.total}
                          variant="muted"
                        />
                      </div>
                    )}
                    {taskMetrics.overdue > 0 ? (
                      <div className="rounded-ui-md border border-ui-danger/25 bg-ui-danger/5 px-ui-3 py-ui-2">
                        <div className="text-[11px] font-medium text-ui-danger">
                          {taskMetrics.overdue === 1
                            ? "1 задача просрочена"
                            : taskMetrics.overdue < 5
                              ? `${taskMetrics.overdue} задачи просрочено`
                              : `${taskMetrics.overdue} задач просрочено`}
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            </WidgetCard>

            {/* Calls widget — placeholder */}
            <WidgetCard title="Звонки">
              <div className="flex min-w-0 flex-col gap-ui-3 p-ui-4">
                <div className="grid grid-cols-2 gap-ui-2">
                  <div className="flex min-w-0 flex-col gap-ui-0.5 rounded-ui-md bg-ui-surface-muted px-ui-3 py-ui-2.5">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-ui-text-muted">
                      Входящие
                    </span>
                    <span className="text-[22px] font-bold tabular-nums text-ui-text">—</span>
                  </div>
                  <div className="flex min-w-0 flex-col gap-ui-0.5 rounded-ui-md bg-ui-surface-muted px-ui-3 py-ui-2.5">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-ui-text-muted">
                      Исходящие
                    </span>
                    <span className="text-[22px] font-bold tabular-nums text-ui-text">—</span>
                  </div>
                </div>
                <div className="flex min-w-0 flex-col gap-ui-0.5 rounded-ui-md bg-ui-surface-muted px-ui-3 py-ui-2.5">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-ui-text-muted">
                    Среднее время ответа
                  </span>
                  <span className="text-[22px] font-bold tabular-nums text-ui-text">—</span>
                </div>
                <p className="text-center text-[11px] text-ui-text-muted/70">
                  Статистика звонков будет доступна в следующем обновлении
                </p>
              </div>
            </WidgetCard>

            {/* Deal sources — placeholder with CSS donut */}
            <WidgetCard title="Источники сделок">
              <div className="flex min-w-0 flex-col items-center gap-ui-4 p-ui-4">
                {/* CSS conic-gradient donut */}
                <div className="relative flex h-[108px] w-[108px] shrink-0 items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "conic-gradient(rgb(47 111 237) 0% 38%, rgb(27 171 117) 38% 62%, rgb(243 158 52) 62% 78%, rgb(222 226 232) 78% 100%)",
                    }}
                  />
                  <div className="absolute inset-[26px] rounded-full bg-ui-surface" />
                  <span className="relative z-10 text-[10px] font-semibold text-ui-text-muted">
                    Скоро
                  </span>
                </div>
                <div className="flex w-full min-w-0 flex-col gap-ui-1.5">
                  {[
                    { label: "Авито", pct: 38, dot: "bg-ui-accent" },
                    { label: "Прямой", pct: 24, dot: "bg-ui-success" },
                    { label: "Реферал", pct: 16, dot: "bg-ui-warn" },
                    { label: "Другое", pct: 22, dot: "bg-ui-border" },
                  ].map(({ label, pct, dot }) => (
                    <div key={label} className="flex min-w-0 items-center gap-ui-2">
                      <span className={cn("h-2 w-2 shrink-0 rounded-full", dot)} />
                      <span className="min-w-0 flex-1 text-[11px] text-ui-text-muted">
                        {label}
                      </span>
                      <span className="shrink-0 text-[11px] tabular-nums text-ui-text-muted">
                        {pct}%
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-center text-[10px] text-ui-text-muted/60">
                  Данные — демонстрационные
                </p>
              </div>
            </WidgetCard>
          </div>

          {/* === Block 4: Bottom two-column row === */}
          <div className="grid grid-cols-1 gap-ui-4 lg:grid-cols-2">

            {/* Managers breakdown — placeholder */}
            <WidgetCard title="Сделки по менеджерам">
              <div className="min-w-0 p-ui-4">
                <div className="flex min-w-0 flex-col gap-ui-3">
                  {[
                    { name: "Иванов А.", deals: 12, revenue: 840_000, pct: 80 },
                    { name: "Петрова М.", deals: 9, revenue: 650_000, pct: 62 },
                    { name: "Сидоров К.", deals: 7, revenue: 420_000, pct: 40 },
                    { name: "Козлова Е.", deals: 5, revenue: 310_000, pct: 30 },
                  ].map(({ name, deals, revenue, pct }) => (
                    <div key={name} className="flex min-w-0 flex-col gap-0.5">
                      <div className="flex min-w-0 items-center justify-between gap-ui-2">
                        <span className="min-w-0 truncate text-[12px] font-medium text-ui-text">
                          {name}
                        </span>
                        <span className="shrink-0 text-[11px] tabular-nums text-ui-text-muted">
                          {deals} · {formatRubles(revenue)}
                        </span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-ui-surface-muted">
                        <div
                          className="h-full rounded-full bg-ui-accent/50 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-ui-4 text-center text-[10px] text-ui-text-muted/60">
                  Данные — демонстрационные. Реальная аналитика по менеджерам в следующем
                  обновлении.
                </p>
              </div>
            </WidgetCard>

            {/* Sales forecast — placeholder */}
            <WidgetCard
              title="Прогноз продаж"
              badge={
                <Badge variant="neutral" badgeSize="small">
                  Скоро
                </Badge>
              }
            >
              <div className="flex min-w-0 flex-col items-center justify-center gap-ui-3 p-ui-4 text-center">
                {/* Bar chart silhouette */}
                <div className="flex h-[88px] w-full items-end justify-around gap-1 px-ui-2">
                  {[32, 55, 41, 78, 63, 88, 70, 45, 62, 80, 55, 72].map((h, i) => (
                    <div
                      key={i}
                      className="min-w-0 flex-1 rounded-t-sm bg-ui-accent/15"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <p className="text-[12px] text-ui-text-muted">
                  Недостаточно данных для отображения прогноза
                </p>
                <p className="text-[11px] text-ui-text-muted/60">
                  Функция появится после накопления достаточного объёма истории сделок
                </p>
              </div>
            </WidgetCard>
          </div>

          {/* === Block 5: Top routes — real data, conditional === */}
          {(analyticsLoading || (analytics?.routes_top && analytics.routes_top.length > 0)) ? (
            <section>
              <SectionLabel>Топ маршрутов · {PERIOD_LABELS[period].toLowerCase()}</SectionLabel>
              <div className="overflow-hidden rounded-ui-lg border border-ui-border bg-ui-surface shadow-sm">
                {analyticsLoading ? (
                  <div className="flex flex-col divide-y divide-ui-border">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-ui-3 px-ui-4 py-ui-3">
                        <Skeleton className="h-3 w-4 shrink-0" variant="text" />
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <Skeleton className="h-3 w-3/5" variant="text" />
                          <Skeleton className="h-2.5 w-1/4" variant="text" />
                        </div>
                        <div className="shrink-0 text-right">
                          <Skeleton className="h-3 w-16" variant="text" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-ui-border">
                    {analytics!.routes_top.slice(0, 6).map((route, i) => (
                      <div
                        key={i}
                        className="flex min-w-0 items-center gap-ui-3 px-ui-4 py-ui-3"
                      >
                        <span className="w-4 shrink-0 text-[11px] tabular-nums text-ui-text-muted">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="min-w-0 truncate text-[12px] font-medium text-ui-text">
                            {route.origin_city ?? "—"} → {route.destination_city ?? "—"}
                          </div>
                          <div className="text-[11px] text-ui-text-muted">
                            {route.total}{" "}
                            {route.total === 1
                              ? "рейс"
                              : route.total < 5
                                ? "рейса"
                                : "рейсов"}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-[12px] font-semibold tabular-nums text-ui-text">
                            {formatRubles(route.avg_rate)}
                          </div>
                          <div className="text-[11px] text-ui-text-muted">средн. ставка</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {/* === Block 6: Carriers — real data, conditional === */}
          {analytics?.carriers && analytics.carriers.length > 0 ? (
            <section>
              <SectionLabel>Перевозчики · {PERIOD_LABELS[period].toLowerCase()}</SectionLabel>
              <div className="overflow-hidden rounded-ui-lg border border-ui-border bg-ui-surface shadow-sm">
                <div className="divide-y divide-ui-border">
                  {analytics.carriers.slice(0, 5).map((carrier, i) => (
                    <div
                      key={i}
                      className="flex min-w-0 items-center gap-ui-3 px-ui-4 py-ui-3"
                    >
                      <span className="w-4 shrink-0 text-[11px] tabular-nums text-ui-text-muted">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="min-w-0 truncate text-[12px] font-medium text-ui-text">
                          {carrier.carrier ?? "Неизвестно"}
                        </div>
                        <div className="text-[11px] text-ui-text-muted">
                          {carrier.total} рейс{carrier.total === 1 ? "" : carrier.total < 5 ? "а" : "ов"}{" "}
                          · {carrier.routes_count}{" "}
                          маршрут{carrier.routes_count === 1 ? "" : carrier.routes_count < 5 ? "а" : "ов"}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[12px] font-semibold tabular-nums text-ui-text">
                          {formatRubles(carrier.avg_rate)}
                        </div>
                        <div className="text-[11px] text-ui-text-muted">средн. ставка</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

        </div>
      </div>
    </div>
  );
}
