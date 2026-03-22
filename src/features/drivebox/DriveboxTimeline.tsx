import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  API_BASE,
  fetchCommunications,
  getUnifiedMessages,
  sendUnifiedMessage,
} from "../../api/api";
import type {
  CommunicationEvent,
} from "../../api/types";
import {
  type ChannelType,
  type TimelineItem,
  formatDuration,
  formatTime,
  mapAvitoToTimeline,
  mapCommunicationToTimeline,
  mapUnifiedToTimeline,
  sortByTime,
} from "../../api/timelineUtils";
import { useWebSocket, type WSEvent } from "../../useWebSocket";
import { Button } from "../../ui/kit";
import { cn } from "../../ui/cn";

type DriveboxTimelineProps = {
  dealId: number;
  clientId?: number | null;
  contactPhoneNormalized?: string | null;
  headerTitle?: string;
  headerSubtitle?: string;
  headerActions?: ReactNode;
  focusComposerKey?: number;
  channelFilter?: "all" | "telegram" | "avito" | "calls";
};

const formatDateLabel = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const eventDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (eventDate.getTime() === today.getTime()) {
    return "Сегодня";
  }
  if (eventDate.getTime() === yesterday.getTime()) {
    return "Вчера";
  }
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};


export function DriveboxTimeline({
  dealId,
  clientId,
  contactPhoneNormalized,
  headerTitle,
  headerSubtitle,
  headerActions,
  focusComposerKey = 0,
  channelFilter = "all",
}: DriveboxTimelineProps) {
  const [chatMessages, setChatMessages] = useState<TimelineItem[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [telegramChatId, setTelegramChatId] = useState<number | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>("auto");
  const [communications, setCommunications] = useState<CommunicationEvent[]>([]);
  const [communicationsError, setCommunicationsError] = useState("");
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const communicationsSeqRef = useRef(0);

  const timelineEvents = useMemo(() => {
    const callEvents = communications
      .map(mapCommunicationToTimeline)
      .filter((msg): msg is TimelineItem => Boolean(msg));
    return sortByTime([...chatMessages, ...callEvents]);
  }, [chatMessages, communications]);

  const visibleEvents = useMemo(() => {
    if (channelFilter === "all") return timelineEvents;
    if (channelFilter === "calls") {
      return timelineEvents.filter((msg) => msg.kind === "call");
    }
    return timelineEvents.filter((msg) => msg.channel === channelFilter);
  }, [channelFilter, timelineEvents]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups: Array<{ dateLabel: string; events: TimelineItem[] }> = [];
    let currentGroup: { dateLabel: string; events: TimelineItem[] } | null = null;

    visibleEvents.forEach((event) => {
      const eventDate = new Date(event.created_at);
      const dateLabel = formatDateLabel(eventDate);

      if (!currentGroup || currentGroup.dateLabel !== dateLabel) {
        currentGroup = { dateLabel, events: [] };
        groups.push(currentGroup);
      }
      currentGroup.events.push(event);
    });

    return groups;
  }, [visibleEvents]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleEvents]);

  useEffect(() => {
    if (!focusComposerKey) return;
    composerRef.current?.focus();
  }, [focusComposerKey]);

  const handleWSEvent = useCallback(
    (event: WSEvent) => {
      if (event.type === "message:created") {
        const { chat_id, deal_id, message } = event.payload;
        if ((chatId && chat_id === chatId) || (deal_id && deal_id === dealId)) {
          const newMsg = mapAvitoToTimeline(message);
          setChatMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          });
        }
      }
      if (event.type === "telegram:message") {
        const { telegram_chat_id, deal_id, message } = event.payload;
        if ((telegramChatId && telegram_chat_id === telegramChatId) || (deal_id && deal_id === dealId)) {
          const newMsg: TimelineItem = {
            id: `telegram-${message.id}`,
            kind: "message",
            direction: message.direction as "in" | "out",
            text: message.text_content ?? "-",
            created_at: message.created_at,
            author: message.direction === "out" ? "Менеджер" : "Клиент",
            source: "Telegram",
            channel: "telegram",
            state: "sent",
          };
          setChatMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          });
        }
      }
    },
    [chatId, telegramChatId, dealId]
  );

  useWebSocket(handleWSEvent);

  useEffect(() => {
    let cancelled = false;
    const loadMessages = async () => {
      try {
        const messagesData = await getUnifiedMessages(dealId);
        if (cancelled) return;
        setChatMessages(messagesData.messages.map(mapUnifiedToTimeline));
        setChatId(messagesData.channels.avito?.chat_id ?? null);
        setTelegramChatId(messagesData.channels.telegram?.chat_id ?? null);
      } catch {
        if (!cancelled) {
          setChatMessages([]);
        }
      }
    };
    loadMessages();
    return () => {
      cancelled = true;
    };
  }, [dealId]);

  useEffect(() => {
    const seq = (communicationsSeqRef.current += 1);
    const controller = new AbortController();
    const normalizedPhone = contactPhoneNormalized?.trim() || "";
    const hasClientId = typeof clientId === "number" && !Number.isNaN(clientId);
    const hasDealId = Boolean(dealId);
    setCommunications([]);
    setCommunicationsError("");

    const loadCommunications = async () => {
      try {
        if (hasClientId) {
          const res = await fetchCommunications({
            client_id: clientId,
            limit: 200,
            signal: controller.signal,
          });
          if (controller.signal.aborted || communicationsSeqRef.current !== seq) return;
          if ((res.items?.length ?? 0) > 0 || !normalizedPhone) {
            setCommunications(res.items ?? []);
            return;
          }
        }
        if (normalizedPhone) {
          const res = await fetchCommunications({
            phone: normalizedPhone,
            limit: 200,
            signal: controller.signal,
          });
          if (controller.signal.aborted || communicationsSeqRef.current !== seq) return;
          setCommunications(res.items ?? []);
          return;
        }
        if (hasDealId) {
          const res = await fetchCommunications({
            deal_id: dealId,
            limit: 200,
            signal: controller.signal,
          });
          if (controller.signal.aborted || communicationsSeqRef.current !== seq) return;
          setCommunications(res.items ?? []);
        }
      } catch (err: any) {
        if (controller.signal.aborted || communicationsSeqRef.current !== seq) return;
        setCommunicationsError(
          err instanceof Error ? err.message : "Не удалось загрузить звонки"
        );
      }
    };

    void loadCommunications();
    return () => {
      controller.abort();
    };
  }, [dealId, clientId, contactPhoneNormalized]);

  const sendMessage = async (text: string, tempId: string, channel: ChannelType = "auto") => {
    const targetChannel =
      channel === "auto" ? (chatId ? "avito" : telegramChatId ? "telegram" : "auto") : channel;
    try {
      await sendUnifiedMessage(dealId, text, targetChannel as "avito" | "telegram" | "auto");
      const messagesData = await getUnifiedMessages(dealId);
      setChatMessages(messagesData.messages.map(mapUnifiedToTimeline));
      setChatId(messagesData.channels.avito?.chat_id ?? null);
      setTelegramChatId(messagesData.channels.telegram?.chat_id ?? null);
    } catch {
      setChatMessages((prev) => prev.map((item) => (item.id === tempId ? { ...item, state: "failed" } : item)));
    }
  };

  const handleSend = async () => {
    const prepared = chatInput.trim();
    if (!prepared) return;
    if (!chatId && !telegramChatId) {
      return;
    }
    const now = new Date().toISOString();
    const tempId = `local-${now}`;
    const displayChannel =
      selectedChannel === "auto"
        ? chatId
          ? "avito"
          : telegramChatId
            ? "telegram"
            : undefined
        : selectedChannel;
    const optimistic: TimelineItem = {
      id: tempId,
      kind: "message",
      direction: "out",
      text: prepared,
      created_at: now,
      author: "Менеджер",
      source: displayChannel === "telegram" ? "Telegram" : displayChannel === "avito" ? "Avito" : "CRM",
      channel: displayChannel as "avito" | "telegram" | undefined,
      state: "pending",
    };
    setChatMessages((prev) => [...prev, optimistic]);
    setChatInput("");
    await sendMessage(prepared, tempId, selectedChannel);
  };

  const retrySend = (msg: TimelineItem) => {
    if (!msg.text?.trim()) return;
    setChatInput(msg.text);
    handleSend();
  };

  const renderCallEvent = (event: TimelineItem) => {
    const callRecordUrl = event.callId ? `${API_BASE}/calls/${event.callId}/record` : null;
    return (
      <div
        key={event.id}
        className={cn(
          "rounded-12 border border-border bg-surface-muted p-4",
          event.direction === "out" ? "ml-auto max-w-[85%]" : "mr-auto max-w-[85%]"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-8 bg-accent/10 text-12 font-semibold text-accent">
              📞
            </div>
            <div>
              <div className="text-13 font-semibold text-text">
                {event.direction === "out" ? "Исходящий звонок" : "Входящий звонок"}
              </div>
              <div className="mt-0.5 text-11 text-muted">
                {formatTime(event.created_at)} · {event.author}
              </div>
            </div>
          </div>
        </div>
        {event.text && event.text !== event.title && (
          <div className="mt-2 text-12 text-text">{event.text}</div>
        )}
        <div className="mt-3 space-y-1.5 text-11 text-muted">
          {event.externalNumber && <div>Клиент: {event.externalNumber}</div>}
          {event.internalNumber && <div>Оператор: {event.internalNumber}</div>}
          {event.callDurationSec !== undefined && event.callDurationSec !== null && (
            <div>Длительность: {formatDuration(event.callDurationSec)}</div>
          )}
          {event.callStatus && <div>Статус: {event.callStatus}</div>}
        </div>
        {callRecordUrl && event.callRecordingAvailable ? (
          <div className="mt-3 space-y-2">
            <audio className="w-full" controls src={callRecordUrl} />
            <div className="flex items-center gap-2">
              <Button
                size="small"
                variant="secondary"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = callRecordUrl;
                  a.download = `call-${event.callId}.mp3`;
                  a.click();
                }}
              >
                Скачать запись
              </Button>
            </div>
          </div>
        ) : event.callId ? (
          <div className="mt-3 text-11 text-muted">Запись появится после завершения звонка</div>
        ) : null}
        {event.transcriptStatus && (
          <div className="mt-2 text-11 text-muted">Транскрипция: {event.transcriptStatus}</div>
        )}
      </div>
    );
  };

  const renderMessageEvent = (event: TimelineItem) => {
    return (
      <div
        key={event.id}
        className={cn("flex", event.direction === "out" ? "justify-end" : "justify-start")}
      >
        <div
          className={cn(
            "max-w-[70%] rounded-12 px-4 py-2.5 text-13 shadow-soft",
            event.direction === "out"
              ? "bg-accent text-white"
              : event.kind === "system"
                ? "border border-border bg-surface text-text"
                : "bg-surface-muted text-text"
          )}
        >
          <div className="whitespace-pre-wrap">{event.text}</div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-11 opacity-80">
            <span>{event.author ?? (event.direction === "out" ? "Менеджер" : "Клиент")}</span>
            <span>·</span>
            <span>{formatTime(event.created_at)}</span>
            {event.source ? (
              <>
                <span>·</span>
                <span>{event.source}</span>
              </>
            ) : null}
            {event.state === "pending" ? <span className="ml-2">отправляем...</span> : null}
            {event.state === "failed" ? (
              <button
                className="ml-2 underline"
                type="button"
                onClick={() => retrySend(event)}
              >
                повторить
              </button>
            ) : null}
            {event.text ? (
              <button
                className="ml-2 underline"
                type="button"
                onClick={() => navigator.clipboard.writeText(event.text)}
              >
                копировать
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col rounded-12 border border-border bg-surface">
      {headerTitle && (
        <div className="border-b border-border px-[var(--space-16)] py-[var(--space-12)]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-14 font-semibold">{headerTitle}</div>
              {headerSubtitle && <div className="mt-1 text-12 text-muted">{headerSubtitle}</div>}
            </div>
            <div className="flex flex-wrap items-center gap-2">{headerActions}</div>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-[var(--space-16)] py-[var(--space-12)]">
        {communicationsError && (
          <div className="mb-3 rounded-8 border border-danger/20 bg-danger/10 px-3 py-2 text-12 text-danger">
            {communicationsError}
          </div>
        )}
        {groupedEvents.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-13 text-muted">Пока нет событий</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedEvents.map((group) => (
              <div key={group.dateLabel} className="space-y-3">
                <div className="sticky top-0 z-10 flex items-center justify-center py-2">
                  <div className="rounded-full bg-surface-muted px-3 py-1 text-11 font-medium text-muted">
                    {group.dateLabel}
                  </div>
                </div>
                {group.events.map((event) => {
                  if (event.kind === "call") {
                    return renderCallEvent(event);
                  }
                  return renderMessageEvent(event);
                })}
              </div>
            ))}
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>
      <div className="border-t border-border px-[var(--space-16)] py-[var(--space-12)]">
        {(chatId || telegramChatId) && chatId && telegramChatId ? (
          <div className="mb-2">
            <select
              className="h-9 w-full rounded-8 border border-border bg-surface px-3 text-12 text-text focus:border-accent/60 focus:outline-none"
              value={selectedChannel}
              onChange={(event) => setSelectedChannel(event.target.value as ChannelType)}
            >
              <option value="auto">Авто</option>
              <option value="avito">Avito</option>
              <option value="telegram">Telegram</option>
            </select>
          </div>
        ) : null}
        <div className="flex items-end gap-2">
          <textarea
            className="min-h-[44px] flex-1 resize-none rounded-10 border border-border bg-surface px-3 py-2 text-12 text-text focus:border-accent/60 focus:outline-none"
            placeholder="Введите сообщение..."
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            ref={composerRef}
          />
          <Button onClick={handleSend} disabled={!chatId && !telegramChatId}>
            Отправить
          </Button>
        </div>
      </div>
    </div>
  );
}
