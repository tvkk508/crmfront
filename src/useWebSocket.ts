import { useEffect, useRef, useCallback } from "react";
import type { AvitoMessage, Deal, TelegramMessage } from "./api/types";

export type WSEvent =
  | { type: "deal:created"; payload: Deal }
  | { type: "deal:updated"; payload: Deal }
  | { type: "deal:deleted"; payload: { id: number } }
  | { type: "message:created"; payload: { chat_id: string; deal_id?: number | null; message: AvitoMessage } }
  | { type: "telegram:message"; payload: { telegram_chat_id: number; deal_id?: number | null; message: TelegramMessage } }
  | { type: "telegram:linked"; payload: { telegram_chat_id: number; deal_id: number; client_id?: number | null } };

type WSEventHandler = (event: WSEvent) => void;

const getWSUrl = () => {
  if (typeof window === "undefined") return "";

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;

  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "ws://localhost:4000/ws";
  }

  return `${protocol}//${host}/ws`;
};

export const useWebSocket = (onEvent: WSEventHandler) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const connect = useCallback(() => {
    const wsUrl = getWSUrl();
    if (!wsUrl) return;

    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    console.log("[WS] connecting", wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WSEvent;
        console.log("[WS] event", data.type);
        onEventRef.current(data);
      } catch (err) {
        console.error("[WS] parse error", err);
      }
    };

    ws.onclose = () => {
      console.log("[WS] closed, reconnecting in 3s");
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = (err) => {
      console.error("[WS] error", err);
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);
};
