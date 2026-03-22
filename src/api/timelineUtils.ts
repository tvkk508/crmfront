/**
 * Shared timeline mapping layer.
 * Single source of truth for message/event normalization used by
 * DealChat.tsx and DriveboxTimeline.tsx.
 */
import type { AvitoMessage, CommunicationEvent, UnifiedMessage } from "./types";

export type ChannelType = "avito" | "telegram" | "auto";

export type TimelineItem = {
  id: string | number;
  kind: "message" | "system" | "call";
  direction: "in" | "out";
  text: string;
  created_at: string;
  author?: string;
  source?: string;
  channel?: "avito" | "telegram" | "calls";
  state?: "sent" | "pending" | "failed";
  // Call-specific
  callId?: number | null;
  callStatus?: string | null;
  callDurationSec?: number | null;
  callRecordingAvailable?: boolean;
  transcriptStatus?: string | null;
  externalNumber?: string | null;
  internalNumber?: string | null;
  title?: string | null;
};

export const formatTime = (value?: string | null, dash = "-"): string => {
  if (!value) return dash;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return dash;
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
};

export const formatDuration = (value?: number | null, dash = "-"): string => {
  if (value === undefined || value === null) return dash;
  const minutes = Math.floor(value / 60);
  const seconds = Math.max(0, value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export const mapUnifiedToTimeline = (message: UnifiedMessage): TimelineItem => {
  const direction: "in" | "out" = message.direction === "out" ? "out" : "in";
  return {
    id: `${message.channel_type}-${message.id}`,
    kind: "message",
    direction,
    text: message.text_content ?? "-",
    created_at: message.created_at ?? new Date().toISOString(),
    author: direction === "out" ? "Менеджер" : "Клиент",
    source: message.channel_type === "telegram" ? "Telegram" : "Avito",
    channel: message.channel_type,
    state: "sent",
  };
};

export const mapAvitoToTimeline = (message: AvitoMessage): TimelineItem => {
  const kindRaw = (message.type ?? message.payload?.type ?? "").toString().toLowerCase();
  const isSystem = kindRaw.includes("system") || kindRaw.includes("status");
  const direction: "in" | "out" = message.direction === "out" ? "out" : "in";
  const author =
    kindRaw.includes("bot") || kindRaw.includes("service")
      ? "Бот/сервис"
      : direction === "out"
        ? "Менеджер"
        : "Клиент";
  const text =
    message.payload?.text ??
    message.payload?.content?.text ??
    message.payload?.message?.text ??
    message.message_id ??
    "-";
  const source =
    message.payload?.source ??
    message.payload?.author?.type ??
    message.payload?.author?.name ??
    (direction === "out" ? "CRM" : "Avito");
  return {
    id: message.id ?? message.message_id,
    kind: isSystem ? "system" : "message",
    direction,
    text,
    created_at: message.created_at ?? new Date().toISOString(),
    author,
    source,
    channel: "avito",
    state: "sent",
  };
};

export const mapCommunicationToTimeline = (item: CommunicationEvent): TimelineItem | null => {
  const isCallLike = item.type === "call" || Boolean(item.call_id) || item.call_recording_available;
  if (!isCallLike) return null;
  const direction: "in" | "out" = item.direction === "out" ? "out" : "in";
  return {
    id: `call-${item.id}`,
    kind: "call",
    direction,
    text: item.title || (direction === "out" ? "Исходящий звонок" : "Входящий звонок"),
    created_at: item.created_at,
    author: direction === "out" ? "Менеджер" : "Клиент",
    source: "Звонок",
    channel: "calls",
    callId: item.call_id ?? null,
    callStatus: item.call_status ?? null,
    callDurationSec: item.call_duration_sec ?? null,
    callRecordingAvailable: item.call_recording_available ?? false,
    transcriptStatus: item.transcript_status ?? null,
    externalNumber: item.external_number_normalized ?? null,
    internalNumber: item.internal_sip_number ?? null,
    title: item.title ?? null,
    state: "sent",
  };
};

export const sortByTime = <T extends { created_at: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
