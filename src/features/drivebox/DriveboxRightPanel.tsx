import { useMemo, type ReactNode } from "react";
import type { DealDetail } from "../../api/view-types";
import {
  Badge,
  Button,
  Card,
  Cluster,
  EmptyState,
  FieldError,
  ScrollArea,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../ui/kit";

type DriveboxRightPanelProps = {
  deal?: DealDetail | null;
  loading?: boolean;
  error?: string;
};

const currencyFormatter = new Intl.NumberFormat("ru-RU");

const buildValue = (value?: number | null) => {
  if (!Number.isFinite(value ?? NaN)) return "-";
  return `${currencyFormatter.format(value ?? 0)} ₽`;
};

function OptionalValueTooltip({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  if (!value || value === "-") {
    return <>{children}</>;
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="left" align="end" className="max-w-[min(20rem,calc(100vw-1rem))] break-words">
        {value}
      </TooltipContent>
    </Tooltip>
  );
}

export function DriveboxRightPanel({ deal, loading, error }: DriveboxRightPanelProps) {
  const dealValue = useMemo(() => buildValue(deal?.value), [deal?.value]);

  const contactName = deal?.client?.name ?? deal?.company ?? "-";
  const contactPhone = deal?.contactPhone ?? deal?.client?.phone ?? "-";
  const contactTelegram = deal?.client?.telegram_username
    ? `@${deal.client.telegram_username}`
    : "-";
  const contactAvito = deal?.client?.avito_profile ?? "-";

  const copyValue = (value: string) => {
    if (!value || value === "-") return;
    void navigator.clipboard.writeText(value);
  };

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col rounded-ui-lg border border-ui-border bg-ui-surface">
      <div className="sticky top-0 z-10 shrink-0 border-b border-ui-border bg-ui-surface px-ui-3 py-ui-3 sm:px-ui-4">
        <div className="min-w-0 text-ui-section-title text-ui-text">Виджеты</div>
        <div className="mt-ui-1 text-ui-caption text-ui-text-muted">Контакт, сделка и интеграции</div>
      </div>
      <ScrollArea
        orientation="vertical"
        className="flex min-h-0 min-w-0 flex-1 flex-col gap-ui-4 px-ui-3 pb-ui-6 pt-ui-4 sm:px-ui-4"
      >
        {loading ? (
          <Card variant="outlined" className="min-w-0 space-y-ui-3 bg-ui-surface-muted p-ui-4">
            <Skeleton className="h-4 w-2/3 max-w-[12rem]" variant="text" />
            <Skeleton className="h-16 w-full" variant="rectangular" />
            <Skeleton className="h-4 w-1/2 max-w-[8rem]" variant="text" />
            <Skeleton className="h-12 w-full" variant="rectangular" />
          </Card>
        ) : null}
        {error ? (
          <FieldError className="rounded-ui-md border border-ui-danger/25 bg-ui-danger/10 px-ui-3 py-ui-4">
            {error}
          </FieldError>
        ) : null}
        {!loading && !deal ? (
          <EmptyState
            title="Выберите диалог"
            description="Чтобы увидеть детали сделки."
            className="items-stretch justify-start rounded-ui-md border border-dashed border-ui-border bg-ui-surface-muted p-ui-4 text-left shadow-none md:p-ui-4 [&_.text-ui-section-title]:text-ui-body [&_.text-ui-section-title]:font-semibold"
          />
        ) : null}
        {deal ? (
          <>
            <Card variant="outlined" className="min-w-0 bg-ui-surface-muted p-ui-4">
              <div className="mb-ui-3 text-[10px] font-semibold uppercase tracking-wide text-ui-text-muted">
                Контакт
              </div>
              <OptionalValueTooltip value={contactName}>
                <div className="mb-ui-4 min-w-0 cursor-default text-ui-body-lg font-semibold text-ui-text sm:truncate">
                  {contactName}
                </div>
              </OptionalValueTooltip>
              <div className="flex min-w-0 flex-col gap-ui-3">
                <div className="flex min-w-0 flex-col gap-ui-2 sm:flex-row sm:items-center sm:justify-between sm:gap-ui-3">
                  <span className="shrink-0 text-ui-caption text-ui-text-muted">Телефон</span>
                  <Cluster gap="sm" align="center" justify="end" className="min-w-0 max-w-full sm:max-w-[min(100%,18rem)]">
                    <span className="min-w-0 text-right font-medium tabular-nums text-ui-text [overflow-wrap:anywhere] sm:text-right">
                      {contactPhone}
                    </span>
                    <Button
                      type="button"
                      size="small"
                      variant="secondary"
                      disabled={contactPhone === "-"}
                      onClick={() => copyValue(contactPhone)}
                    >
                      Копировать
                    </Button>
                  </Cluster>
                </div>
                <div className="flex min-w-0 flex-col gap-ui-2 sm:flex-row sm:items-center sm:justify-between sm:gap-ui-3">
                  <span className="shrink-0 text-ui-caption text-ui-text-muted">Telegram</span>
                  <Cluster gap="sm" align="center" justify="end" className="min-w-0 max-w-full sm:max-w-[min(100%,18rem)]">
                    <OptionalValueTooltip value={contactTelegram}>
                      <span className="min-w-0 max-w-full cursor-default truncate text-right font-medium text-ui-text sm:max-w-[11rem]">
                        {contactTelegram}
                      </span>
                    </OptionalValueTooltip>
                    {contactTelegram !== "-" ? (
                      <Button
                        type="button"
                        size="small"
                        variant="secondary"
                        onClick={() => copyValue(contactTelegram)}
                      >
                        Копировать
                      </Button>
                    ) : null}
                  </Cluster>
                </div>
                <div className="flex min-w-0 flex-col gap-ui-2 sm:flex-row sm:items-center sm:justify-between sm:gap-ui-3">
                  <span className="shrink-0 text-ui-caption text-ui-text-muted">Avito</span>
                  <Cluster gap="sm" align="center" justify="end" className="min-w-0 max-w-full sm:max-w-[min(100%,18rem)]">
                    <OptionalValueTooltip value={contactAvito}>
                      <span className="min-w-0 max-w-full cursor-default truncate text-right font-medium text-ui-text sm:max-w-[11rem]">
                        {contactAvito}
                      </span>
                    </OptionalValueTooltip>
                    {contactAvito !== "-" ? (
                      <Button
                        type="button"
                        size="small"
                        variant="secondary"
                        onClick={() => copyValue(contactAvito)}
                      >
                        Копировать
                      </Button>
                    ) : null}
                  </Cluster>
                </div>
              </div>
            </Card>
            <Card variant="outlined" className="min-w-0 bg-ui-surface-muted p-ui-4">
              <Cluster gap="sm" align="center" justify="between" className="mb-ui-3 min-w-0">
                <div className="min-w-0 text-[10px] font-semibold uppercase tracking-wide text-ui-text-muted">
                  Сделка
                </div>
                {deal.status ? (
                  <Badge variant="accent" className="max-w-[10rem] shrink-0 truncate">
                    {deal.status}
                  </Badge>
                ) : null}
              </Cluster>
              <div className="flex min-w-0 flex-col gap-ui-3">
                <div className="flex min-w-0 flex-col gap-ui-1 sm:flex-row sm:items-center sm:justify-between sm:gap-ui-3">
                  <span className="shrink-0 text-ui-caption text-ui-text-muted">ID</span>
                  <span className="min-w-0 font-medium tabular-nums text-ui-text sm:text-right">#{deal.id}</span>
                </div>
                <div className="flex min-w-0 flex-col gap-ui-1 sm:flex-row sm:items-center sm:justify-between sm:gap-ui-3">
                  <span className="shrink-0 text-ui-caption text-ui-text-muted">Этап</span>
                  <OptionalValueTooltip value={deal.stage ?? "-"}>
                    <span className="min-w-0 max-w-full cursor-default text-right font-medium text-ui-text [overflow-wrap:anywhere] sm:max-w-[14rem] sm:truncate">
                      {deal.stage ?? "-"}
                    </span>
                  </OptionalValueTooltip>
                </div>
                <div className="flex min-w-0 flex-col gap-ui-1 sm:flex-row sm:items-center sm:justify-between sm:gap-ui-3">
                  <span className="shrink-0 text-ui-caption text-ui-text-muted">Сумма</span>
                  <span className="min-w-0 text-right font-semibold tabular-nums text-ui-text">{dealValue}</span>
                </div>
                <div className="flex min-w-0 flex-col gap-ui-1 sm:flex-row sm:items-center sm:justify-between sm:gap-ui-3">
                  <span className="shrink-0 text-ui-caption text-ui-text-muted">Ответственный</span>
                  <OptionalValueTooltip value={deal.owner ?? "-"}>
                    <span className="min-w-0 max-w-full cursor-default text-right font-medium text-ui-text [overflow-wrap:anywhere] sm:max-w-[14rem] sm:truncate">
                      {deal.owner ?? "-"}
                    </span>
                  </OptionalValueTooltip>
                </div>
              </div>
            </Card>
            <Card variant="outlined" className="min-w-0 bg-ui-surface-muted p-ui-4">
              <div className="mb-ui-3 text-[10px] font-semibold uppercase tracking-wide text-ui-text-muted">Заметки</div>
              <div className="text-ui-caption text-ui-text-muted">Пока заметок нет.</div>
            </Card>
            <Card variant="outlined" className="min-w-0 bg-ui-surface-muted p-ui-4">
              <Cluster gap="sm" align="center" justify="between" className="mb-ui-3 min-w-0">
                <div className="min-w-0 text-[10px] font-semibold uppercase tracking-wide text-ui-text-muted">
                  Интеграции
                </div>
                <Badge variant="neutral" badgeSize="small" className="shrink-0 tabular-nums">
                  2
                </Badge>
              </Cluster>
              <div className="flex min-w-0 flex-col gap-ui-3">
                <Card variant="outlined" className="min-w-0 bg-ui-surface p-ui-3">
                  <div className="flex min-w-0 flex-col gap-ui-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-ui-text">Okidoki</div>
                      <div className="mt-ui-1 text-[10px] text-ui-text-muted">Автовыставление уведомлений</div>
                    </div>
                    <Button type="button" size="small" variant="secondary" className="w-full shrink-0 sm:w-auto">
                      Открыть
                    </Button>
                  </div>
                </Card>
                <Card variant="outlined" className="min-w-0 bg-ui-surface p-ui-3">
                  <div className="flex min-w-0 flex-col gap-ui-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-ui-text">Call widget</div>
                      <div className="mt-ui-1 text-[10px] text-ui-text-muted">Записи разговоров за 2 месяца</div>
                    </div>
                    <Button type="button" size="small" variant="secondary" className="w-full shrink-0 sm:w-auto">
                      Открыть
                    </Button>
                  </div>
                </Card>
              </div>
            </Card>
          </>
        ) : null}
      </ScrollArea>
    </div>
  );
}
