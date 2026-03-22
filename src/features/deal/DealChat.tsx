import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  API_BASE,
  fetchCommunications,
  generateTelegramLink,
  getTelegramStatus,
  getUnifiedMessages,
  sendUnifiedMessage,
} from "../../api/api";
import type {
  CommunicationEvent,
  TelegramStatus,
  UnifiedMessage,
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
import { Button, Badge } from "../../ui/kit";
import { cn } from "../../ui/cn";

type DealChatProps = {
  dealId: number;
  clientId?: number | null;
  contactPhoneNormalized?: string | null;
  rightOpen?: boolean;
  onToggleRight?: () => void;
  headerTitle?: string;
  headerSubtitle?: string;
  headerActions?: ReactNode;
  hideHeader?: boolean;
  focusComposerKey?: number;
  channelFilter?: "all" | "telegram" | "avito" | "calls";
};

const fallbackDash = "-";

const formatDateShort = (value?: string | null, dash = fallbackDash) => {
  if (!value) return dash;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return dash;
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
};

const mapUnifiedChatList = (messages: UnifiedMessage[] = []): TimelineItem[] =>
  sortByTime(messages.map(mapUnifiedToTimeline));

export function DealChat({
  dealId,
  clientId,
  contactPhoneNormalized,
  rightOpen,
  onToggleRight,
  headerTitle,
  headerSubtitle,
  headerActions,
  hideHeader,
  focusComposerKey = 0,
  channelFilter = "all",
}: DealChatProps) {
  const [chatMessages, setChatMessages] = useState<TimelineItem[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [telegramChatId, setTelegramChatId] = useState<number | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>("auto");
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus | null>(null);
  const [telegramLinkLoading, setTelegramLinkLoading] = useState(false);
  const [telegramLink, setTelegramLink] = useState<string | null>(null);
  const [showTelegramLink, setShowTelegramLink] = useState(false);
  const [communications, setCommunications] = useState<CommunicationEvent[]>([]);
  const [communicationsError, setCommunicationsError] = useState("");
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const communicationsSeqRef = useRef(0);


  const timelineMessages = useMemo(() => {
    const callMessages = communications
      .map(mapCommunicationToTimeline)
      .filter((msg): msg is TimelineItem => Boolean(msg));
    return [...chatMessages, ...callMessages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [chatMessages, communications]);

  const visibleMessages = useMemo(() => {
    if (channelFilter === "all") return timelineMessages;
    if (channelFilter === "calls") {
      return timelineMessages.filter((msg) => msg.kind === "call");
    }
    return timelineMessages.filter((msg) => msg.channel === channelFilter);
  }, [channelFilter, timelineMessages]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages]);

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
      if (event.type === "telegram:linked") {
        const { telegram_chat_id, deal_id } = event.payload;
        if (deal_id === dealId) {
          setTelegramChatId(telegram_chat_id);
          setTelegramLink(null);
          setTelegramStatus((prev: TelegramStatus | null) =>
            prev
              ? { ...prev, has_telegram: true, has_active_token: false, active_token_expires: null }
              : { has_telegram: true, has_active_token: false, active_token_expires: null }
          );
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
          setTelegramStatus((prev: TelegramStatus | null) =>
            prev
              ? { ...prev, has_telegram: true }
              : { has_telegram: true, has_active_token: false, active_token_expires: null }
          );
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
        setChatMessages(mapUnifiedChatList(messagesData.messages));
        setChatId(messagesData.channels.avito?.chat_id ?? null);
        setTelegramChatId(messagesData.channels.telegram?.chat_id ?? null);
        const statusData = await getTelegramStatus(dealId);
        if (cancelled) return;
        setTelegramLink(statusData.active_token_link ?? null);
        setTelegramStatus({
          has_telegram: statusData.has_telegram,
          has_active_token: statusData.has_active_token,
          active_token_expires: statusData.active_token_expires,
          active_token_link: statusData.active_token_link ?? null,
        });
      } catch {
        if (!cancelled) {
          setChatMessages([]);
          setTelegramStatus(null);
          setTelegramLink(null);
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
      setChatMessages(mapUnifiedChatList(messagesData.messages));
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

  const handleGenerateTelegramLink = async () => {
    if (telegramLink) return;
    setTelegramLinkLoading(true);
    try {
      const result = await generateTelegramLink(dealId);
      setTelegramLink(result.link);
      setTelegramStatus((prev: TelegramStatus | null) =>
        prev
          ? {
              ...prev,
              has_active_token: true,
              active_token_expires: result.expires_at,
              active_token_link: result.link,
            }
          : {
              has_telegram: false,
              has_active_token: true,
              active_token_expires: result.expires_at,
              active_token_link: result.link,
            }
      );
    } catch {
      // generation failed
    } finally {
      setTelegramLinkLoading(false);
    }
  };

  const chatWithDates = () => {
    let lastDate = "";
    return visibleMessages.map((msg) => {
      const dateLabel = formatDateShort(msg.created_at, "");
      const showDivider = dateLabel && dateLabel !== lastDate;
      const timeLabel = formatTime(msg.created_at);
      lastDate = dateLabel;

      if (msg.kind === "call") {
        return (
          <div key={msg.id} className="space-y-2">
            {showDivider ? (
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wide">{dateLabel}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            ) : null}
            <div
              className={cn(
                "max-w-[85%] rounded-md border border-border bg-surface-muted p-3",
                msg.direction === "out" ? "ml-auto" : "mr-auto"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-text-primary">
                  {msg.direction === "out" ? "📞 Исходящий звонок" : "📞 Входящий звонок"}
                </span>
                <span className="text-[10px] text-text-tertiary">{timeLabel}</span>
              </div>
              <div className="mt-2 space-y-0.5 text-[11px] text-text-secondary">
                {msg.externalNumber && <div>Клиент: <span className="tabular-nums">{msg.externalNumber}</span></div>}
                {msg.internalNumber && <div>Оператор: <span className="tabular-nums">{msg.internalNumber}</span></div>}
                {msg.callDurationSec !== undefined && msg.callDurationSec !== null && (
                  <div>Длительность: <span className="font-medium">{formatDuration(msg.callDurationSec)}</span></div>
                )}
              </div>
              {msg.text ? <div className="mt-2 text-xs text-text-primary">{msg.text}</div> : null}
              {msg.callRecordingAvailable && msg.callId ? (
                <div className="mt-3 space-y-2">
                  <audio className="w-full h-8" controls src={`${API_BASE}/calls/${msg.callId}/record`} />
                  <a
                    className="inline-flex text-[10px] text-button-primary hover:underline"
                    href={`${API_BASE}/calls/${msg.callId}/record`}
                    download
                  >
                    Скачать запись
                  </a>
                </div>
              ) : (
                <div className="mt-2 text-[10px] text-text-tertiary italic">Запись появится после завершения звонка</div>
              )}
              {msg.transcriptStatus ? (
                <div className="mt-2 text-[10px] text-text-tertiary">Транскрипция: {msg.transcriptStatus}</div>
              ) : null}
            </div>
          </div>
        );
      }

      return (
        <div key={msg.id} className="space-y-2">
          {showDivider ? (
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wide">{dateLabel}</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          ) : null}
          <div className={cn("flex", msg.direction === "out" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                msg.direction === "out" 
                  ? "bg-button-primary text-white rounded-br-sm" 
                  : "bg-surface-muted text-text-primary rounded-bl-sm",
                msg.kind === "system" && "border border-border bg-surface text-text-tertiary text-xs"
              )}
            >
              <div className="whitespace-pre-wrap break-words">{msg.text}</div>
              <div className={cn(
                "mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]",
                msg.direction === "out" ? "text-white/70" : "text-text-tertiary"
              )}>
                <span>{msg.author ?? (msg.direction === "out" ? "Менеджер" : "Клиент")}</span>
                <span>·</span>
                <span>{timeLabel}</span>
                {msg.source ? (
                  <>
                    <span>·</span>
                    <span>{msg.source}</span>
                  </>
                ) : null}
                {msg.state === "pending" ? <span className="ml-1 animate-pulse">отправляем...</span> : null}
                {msg.state === "failed" ? (
                  <button
                    className={cn("ml-1 underline", msg.direction === "out" ? "text-white/90" : "text-button-primary")}
                    type="button"
                    onClick={() => retrySend(msg)}
                  >
                    повторить
                  </button>
                ) : null}
                {msg.text ? (
                  <button
                    className={cn("ml-1 hover:underline", msg.direction === "out" ? "text-white/70" : "text-text-tertiary")}
                    type="button"
                    onClick={() => navigator.clipboard.writeText(msg.text)}
                  >
                    копировать
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col rounded-md border border-border bg-surface">
      {!hideHeader ? (
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-text-primary">{headerTitle ?? "Диалог с клиентом"}</h3>
              {headerSubtitle ? (
                <p className="mt-0.5 text-xs text-text-tertiary">{headerSubtitle}</p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {chatId ? (
                  <Badge variant="accent" badgeSize="small">Avito</Badge>
                ) : null}
                {telegramChatId ? (
                  <Badge variant="accent" badgeSize="small">Telegram</Badge>
                ) : null}
                {!chatId && !telegramChatId ? <span className="text-xs text-text-tertiary">Нет каналов связи</span> : null}
              </div>
              {telegramLink && showTelegramLink ? (
                <div className="mt-2 min-w-0 rounded-sm border border-border bg-surface-muted px-2.5 py-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <a
                      className="min-w-0 flex-1 truncate text-[11px] text-button-primary hover:underline"
                      href={telegramLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {telegramLink}
                    </a>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => { void navigator.clipboard.writeText(telegramLink); }}
                    >
                      Копировать
                    </Button>
                    <Button
                      size="small"
                      variant="tertiary"
                      onClick={() => setShowTelegramLink(false)}
                    >
                      Скрыть
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {headerActions ? headerActions : null}
              {!telegramStatus?.has_telegram ? (
                telegramLink ? (
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => setShowTelegramLink((v) => !v)}
                  >
                    {showTelegramLink ? "Скрыть ссылку" : "Просмотреть ссылку"}
                  </Button>
                ) : (
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={handleGenerateTelegramLink}
                    disabled={telegramLinkLoading}
                  >
                    {telegramLinkLoading ? "..." : "Подключить Telegram"}
                  </Button>
                )
              ) : null}
              <Badge variant="neutral" badgeSize="small">{visibleMessages.length}</Badge>
              {onToggleRight ? (
                <Button size="small" variant="tertiary" onClick={onToggleRight}>
                  {rightOpen ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  )}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin">
        {communicationsError ? (
          <div className="mb-3 px-3 py-2 rounded-sm bg-danger/10 text-xs text-danger">{communicationsError}</div>
        ) : null}
        {visibleMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm text-text-secondary">Пока нет сообщений</p>
            <p className="mt-1 text-xs text-text-tertiary">Начните переписку с клиентом</p>
          </div>
        ) : (
          <div className="space-y-3">{chatWithDates()}</div>
        )}
        <div ref={chatBottomRef} />
      </div>
      {/* Composer */}
      <div className="border-t border-border px-4 py-3">
        {(chatId || telegramChatId) && chatId && telegramChatId ? (
          <div className="mb-2">
            <select
              className="h-8 rounded-sm border border-border bg-surface px-2 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-button-primary/30"
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
            className={cn(
              "min-h-[44px] flex-1 resize-none rounded-sm border border-border bg-surface px-3 py-2.5",
              "text-sm text-text-primary placeholder:text-text-tertiary",
              "focus:border-button-primary/60 focus:outline-none focus:ring-2 focus:ring-button-primary/20",
              "transition-colors"
            )}
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
          <Button
            onClick={handleSend}
            disabled={!chatId && !telegramChatId}
            variant="primary"
            size="medium"
          >
            Отправить
          </Button>
        </div>
      </div>
    </div>
  );
}
