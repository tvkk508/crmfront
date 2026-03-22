import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { usePipelineQuery } from "../features/pipeline/usePipeline";
import { formatRubles } from "../features/pipeline/format";
import { Card, Button } from "../ui/kit";
import { useManagerStatsQuery } from "../features/manager/useManagerStats";

const roleLabels: Record<string, string> = {
  admin: "Админ",
  user: "Пользователь",
};

export function CabinetPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = usePipelineQuery({
    responsibleUserId: user?.id,
  });
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useManagerStatsQuery(user?.id);

  // Принудительное обновление статистики при входе в профиль
  useEffect(() => {
    if (user?.id) {
      refetchStats();
    }
  }, [user?.id, refetchStats]);

  const stages = data?.stages ?? [];
  const stageLabel = new Map(stages.map((stage) => [stage.id, stage.title]));
  const deals = data?.deals ?? [];

  return (
    <div className="flex flex-col h-full min-h-0 w-full bg-bg page-enter">
      <div className="sticky top-0 z-10 bg-surface border-b border-border px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold text-text-primary">Личный кабинет</h1>
            <p className="text-xs text-text-tertiary">Мои назначенные сделки</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <span className="font-medium text-text-primary">{deals.length}</span>
            сделок
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <div className="text-xs text-text-tertiary">Пользователь</div>
              <div className="text-sm font-semibold text-text-primary">{user?.name}</div>
              <div className="text-xs text-text-tertiary">@{user?.login}</div>
            </div>
            <div className="ml-auto">
              <div className="text-xs text-text-tertiary">Роль</div>
              <div className="text-sm font-semibold text-text-primary">
                {roleLabels[user?.role ?? "user"]}
              </div>
            </div>
          </div>
        </Card>

        {/* Статистика менеджера */}
        {statsLoading ? (
          <Card className="p-4">
            <div className="text-xs text-text-tertiary">Загрузка статистики...</div>
          </Card>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-text-tertiary mb-1">Машины в пути</div>
                  <div className="text-2xl font-bold text-text-primary">{stats.cars_in_transit}</div>
                  <div className="text-xs text-text-tertiary mt-1">
                    Формирование договора, поиск перевозчика, на стоянке, отправлено, промежуточный пункт
                  </div>
                </div>
                <div className="text-3xl">🚚</div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-text-tertiary mb-1">Всего сделок</div>
                  <div className="text-2xl font-bold text-text-primary">{stats.total_deals}</div>
                  <div className="text-xs text-text-tertiary mt-1">
                    Все сделки в воронке
                  </div>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-text-tertiary mb-1">Денег едет</div>
                  <div className="text-2xl font-bold text-accent">{formatRubles(stats.money_in_transit)}</div>
                  <div className="text-xs text-text-tertiary mt-1">
                    Сумма из сделок в пути
                  </div>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-text-tertiary mb-1">Денег заработано</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatRubles(stats.money_earned)}</div>
                  <div className="text-xs text-text-tertiary mt-1">
                    Сумма из сделок в этапе "Прибыл"
                  </div>
                </div>
                <div className="text-3xl">✅</div>
              </div>
            </Card>
          </div>
        ) : null}

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary">Назначенные сделки</h2>
            <Link to="/">
              <Button size="small" variant="secondary">Открыть воронку</Button>
            </Link>
          </div>
          {isLoading ? (
            <div className="text-xs text-text-tertiary">Загрузка...</div>
          ) : error ? (
            <div className="text-xs text-danger">Не удалось загрузить сделки</div>
          ) : deals.length === 0 ? (
            <div className="text-xs text-text-tertiary">Назначенных сделок пока нет.</div>
          ) : (
            <div className="divide-y divide-border">
              {deals.map((deal) => (
                <Link
                  key={deal.id}
                  to={`/deal/${deal.id}`}
                  className="flex items-center justify-between py-2 text-sm hover:text-button-primary transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-text-primary truncate">{deal.contact}</div>
                    <div className="text-xs text-text-tertiary">
                      Этап: {stageLabel.get(deal.stageId) ?? deal.stageId}
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary tabular-nums">
                    {formatRubles(deal.value)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
