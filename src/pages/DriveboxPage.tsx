import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { DriveboxItem, DriveboxGroup, DriveboxResponse, Deal } from "../api/types";
import {
  fetchDrivebox,
  getDriveboxUnreadCount,
  markAllDriveboxItemsRead,
  markDriveboxDealRead,
  markDriveboxDealUnread,
  markDriveboxItemRead,
  markDriveboxItemUnread,
  fetchDealById,
} from "../api/api";
import { Badge, Button, Input, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/kit";
import { cn } from "../ui/cn";
import { DriveboxTimeline } from "../features/drivebox/DriveboxTimeline";
import "./DriveboxPage.css";

type DriveboxChannel = "telegram" | "avito" | "calls" | "unknown";

type DriveboxRow = {
  key: string;
  dealId: number;
  title: string;
  preview: string;
  channel: DriveboxChannel;
  time: string;
  unreadCount: number;
  isUnread: boolean;
  kind: "deal" | "item";
  item?: DriveboxItem;
  group?: DriveboxGroup;
  // Additional display fields
  fromLocation?: string | null;
  toLocation?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  callStatus?: string | null;
  callDirection?: "in" | "out" | null;
  callDurationSec?: number | null;
};

const PAGE_SIZE = 100; // Увеличенный размер страницы
const INITIAL_LOAD_SIZE = 500; // Загружаем больше при первом запросе
const SEARCH_DELAY = 300;
const ROW_HEIGHT = 64; // Компактная высота строки

const formatTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const eventDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (eventDate.getTime() === today.getTime()) {
    return `Сегодня ${date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (eventDate.getTime() === yesterday.getTime()) {
    return `Вчера ${date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getChannelIcon = (channel: DriveboxChannel) => {
  switch (channel) {
    case "telegram":
      return "TG";
    case "avito":
      return "AV";
    case "calls":
      return "TEL";
    default:
      return "MSG";
  }
};

const getChannelLabel = (channel: DriveboxChannel) => {
  switch (channel) {
    case "telegram":
      return "Telegram";
    case "avito":
      return "Avito";
    case "calls":
      return "Звонок";
    default:
      return "Сообщение";
  }
};

const formatDuration = (seconds?: number | null) => {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `0:${secs.toString().padStart(2, "0")}`;
};

const getCallStatusLabel = (status?: string | null, direction?: "in" | "out" | null) => {
  if (!status) return null;
  const statusLower = status.toLowerCase();
  if (statusLower === "answered" || statusLower === "success") {
    return { label: direction === "out" ? "Исходящий" : "Входящий", cssClass: "answered" };
  }
  if (statusLower === "missed" || statusLower === "no_answer" || statusLower === "noanswer") {
    return { label: "Пропущен", cssClass: "missed" };
  }
  if (statusLower === "busy") {
    return { label: "Занято", cssClass: "missed" };
  }
  if (direction === "out") {
    return { label: "Исходящий", cssClass: "outgoing" };
  }
  if (direction === "in") {
    return { label: "Входящий", cssClass: "incoming" };
  }
  return null;
};

const formatRoute = (from?: string | null, to?: string | null) => {
  if (!from && !to) return null;
  if (from && to) return `${from} → ${to}`;
  return from || to;
};

const resolvePreview = (item?: DriveboxItem | null) => {
  if (!item) return "Без текста";
  const candidates = [
    item.preview,
    item.title,
    item.payload?.text,
    item.payload?.content?.text,
    item.payload?.message?.text,
  ];
  const found = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0
  );
  return found ? found.trim() : "Без текста";
};


export function DriveboxPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filterParam = searchParams.get("filter");
  const filter: "all" | "unread" = filterParam === "all" ? "all" : "unread";
  const channelParam = searchParams.get("channel");
  const channel: "all" | "telegram" | "avito" | "calls" =
    channelParam === "telegram" ||
    channelParam === "avito" ||
    channelParam === "calls"
      ? channelParam
      : "all";
  const groupByParam = searchParams.get("groupBy");
  const groupBy: "none" | "deal" = groupByParam === "deal" ? "deal" : "none";
  const mineParam = searchParams.get("mine");
  const mine = mineParam === null ? true : mineParam !== "0";
  const queryParam = searchParams.get("q") ?? "";

  const [searchInput, setSearchInput] = useState(queryParam);
  const [searchValue, setSearchValue] = useState(queryParam);
  const [data, setData] = useState<DriveboxResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextOffset, setNextOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeRowKey, setActiveRowKey] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<number | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [dealLoading, setDealLoading] = useState(false);
  const [dealError, setDealError] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const updateSearchParams = useCallback(
    (updates: Record<string, string | number | boolean | undefined | null>) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const notifyUnreadCount = useCallback((count: number) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("drivebox:unread-count", {
        detail: { unreadCount: count },
      })
    );
  }, []);

  const applyUnreadCount = useCallback(
    (count: number) => {
      setUnreadCount(count);
      notifyUnreadCount(count);
    },
    [notifyUnreadCount]
  );

  const updateUnreadCountDelta = useCallback(
    (delta: number) => {
      setUnreadCount((prev) => {
        const next = Math.max(0, prev + delta);
        notifyUnreadCount(next);
        return next;
      });
    },
    [notifyUnreadCount]
  );

  const loadData = useCallback(
    async (options?: { append?: boolean; offset?: number; silent?: boolean; loadAll?: boolean }) => {
      const append = options?.append ?? false;
      const offset = options?.offset ?? 0;
      const silent = options?.silent ?? false;
      const loadAll = options?.loadAll ?? false;

      if (!silent) {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setLoading(true);
        }
      } else if (append) {
        setIsLoadingMore(true);
      }

      setError("");
      try {
        // При первой загрузке или loadAll загружаем больше элементов
        const pageSize = loadAll ? 10000 : (offset === 0 ? INITIAL_LOAD_SIZE : PAGE_SIZE);
        
        const result = await fetchDrivebox({
          filter,
          channel,
          groupBy,
          mine,
          limit: pageSize,
          offset,
        });
        setData((prev) => {
          if (!append || !prev) {
            return result;
          }
          if (groupBy === "deal") {
            return {
              ...result,
              groups: [...(prev.groups ?? []), ...(result.groups ?? [])],
              items: null,
            };
          }
          return {
            ...result,
            items: [...(prev.items ?? []), ...(result.items ?? [])],
            groups: null,
          };
        });
        applyUnreadCount(result.unread_count);
        setHasMore(Boolean(result.has_more));
        setNextOffset(result.next_offset ?? 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось загрузить Drivebox");
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [filter, channel, groupBy, mine, applyUnreadCount]
  );

  const loadUnreadCount = useCallback(async () => {
    try {
      const result = await getDriveboxUnreadCount();
      applyUnreadCount(result.unread_count);
    } catch (err) {
      console.error("Failed to load unread count", err);
    }
  }, [applyUnreadCount]);

  // Load deal details for right panel
  const loadDealDetails = useCallback(async (dealId: number) => {
    setDealLoading(true);
    setDealError("");
    try {
      const deal = await fetchDealById(dealId);
      setSelectedDeal(deal);
    } catch (err) {
      setDealError(err instanceof Error ? err.message : "Не удалось загрузить сделку");
      setSelectedDeal(null);
    } finally {
      setDealLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDealId) {
      loadDealDetails(selectedDealId);
    } else {
      setSelectedDeal(null);
    }
  }, [selectedDealId, loadDealDetails]);

  const updateItemReadState = useCallback(
    (itemId: string, isUnread: boolean) => {
      setData((prev) => {
        if (!prev) return prev;

        if (prev.items) {
          const updatedItems = prev.items.map((item) =>
            item.id === itemId ? { ...item, is_unread: isUnread } : item
          );
          const visibleItems =
            filter === "unread"
              ? updatedItems.filter((item) => item.is_unread)
              : updatedItems;
          return { ...prev, items: visibleItems };
        }

        if (prev.groups) {
          const updatedGroups = prev.groups
            .map((group) => {
              let nextUnreadCount = group.unread_count;
              const updatedItems = group.items.map((item) => {
                if (item.id !== itemId) return item;
                const wasUnread = Boolean(item.is_unread);
                if (wasUnread !== isUnread) {
                  nextUnreadCount += isUnread ? 1 : -1;
                }
                return { ...item, is_unread: isUnread };
              });
              nextUnreadCount = Math.max(0, nextUnreadCount);
              const visibleItems =
                filter === "unread"
                  ? updatedItems.filter((item) => item.is_unread)
                  : updatedItems;
              return { ...group, items: visibleItems, unread_count: nextUnreadCount };
            })
            .filter((group) => (filter === "unread" ? group.unread_count > 0 : true));

          return { ...prev, groups: updatedGroups };
        }

        return prev;
      });
    },
    [filter]
  );

  const updateDealReadState = useCallback(
    (dealId: number, isUnread: boolean) => {
      setData((prev) => {
        if (!prev) return prev;

        if (prev.groups) {
          const updatedGroups = prev.groups
            .map((group) => {
              if (group.deal_id !== dealId) return group;
              const nextUnreadCount = isUnread
                ? Math.max(group.unread_count, Math.max(group.items.length, 1))
                : 0;
              return {
                ...group,
                unread_count: nextUnreadCount,
                items: group.items.map((item) => ({
                  ...item,
                  is_unread: isUnread,
                })),
              };
            })
            .filter((group) => (filter === "unread" ? group.unread_count > 0 : true));
          return { ...prev, groups: updatedGroups };
        }

        if (prev.items) {
          const updatedItems = prev.items.map((item) =>
            item.deal_id === dealId ? { ...item, is_unread: isUnread } : item
          );
          const visibleItems =
            filter === "unread"
              ? updatedItems.filter((item) => item.is_unread)
              : updatedItems;
          return { ...prev, items: visibleItems };
        }

        return prev;
      });
    },
    [filter]
  );

  const applyMarkAllState = useCallback(() => {
    setData((prev) => {
      if (!prev) return prev;

      if (prev.items) {
        if (filter === "unread") {
          return { ...prev, items: [] };
        }
        return {
          ...prev,
          items: prev.items.map((item) => ({ ...item, is_unread: false })),
        };
      }

      if (prev.groups) {
        if (filter === "unread") {
          return { ...prev, groups: [] };
        }
        return {
          ...prev,
          groups: prev.groups.map((group) => ({
            ...group,
            unread_count: 0,
            items: group.items.map((item) => ({ ...item, is_unread: false })),
          })),
        };
      }

      return prev;
    });
  }, [filter]);

  const estimateDealUnread = useCallback(
    (dealId: number) => {
      if (data?.groups) {
        const group = data.groups.find((item) => item.deal_id === dealId);
        if (group) return Math.max(group.unread_count, 0);
      }
      if (data?.items) {
        return data.items.filter(
          (item) => item.deal_id === dealId && item.is_unread
        ).length;
      }
      return 0;
    },
    [data]
  );

  const estimateDealItems = useCallback(
    (dealId: number) => {
      if (data?.groups) {
        const group = data.groups.find((item) => item.deal_id === dealId);
        if (group) return Math.max(group.items.length, 1);
      }
      if (data?.items) {
        const count = data.items.filter((item) => item.deal_id === dealId).length;
        return Math.max(count, 1);
      }
      return 1;
    },
    [data]
  );

  const markDealRead = useCallback(
    async (dealId: number) => {
      const snapshot = data;
      const snapshotCount = unreadCount;
      const estimate = estimateDealUnread(dealId);
      setError("");
      updateDealReadState(dealId, false);
      if (estimate > 0) {
        updateUnreadCountDelta(-estimate);
      }
      try {
        await markDriveboxDealRead(dealId);
        loadUnreadCount();
      } catch {
        setData(snapshot);
        applyUnreadCount(snapshotCount);
        setError("Не удалось отметить диалог прочитанным. Повторите попытку.");
      }
    },
    [
      data,
      unreadCount,
      estimateDealUnread,
      updateDealReadState,
      updateUnreadCountDelta,
      loadUnreadCount,
      applyUnreadCount,
    ]
  );

  const markDealUnread = useCallback(
    async (dealId: number) => {
      const snapshot = data;
      const snapshotCount = unreadCount;
      const estimate = estimateDealItems(dealId);
      setError("");
      updateDealReadState(dealId, true);
      updateUnreadCountDelta(estimate);
      try {
        await markDriveboxDealUnread(dealId);
        loadUnreadCount();
      } catch {
        setData(snapshot);
        applyUnreadCount(snapshotCount);
        setError("Не удалось отметить диалог непрочитанным. Повторите попытку.");
      }
    },
    [
      data,
      unreadCount,
      estimateDealItems,
      updateDealReadState,
      updateUnreadCountDelta,
      loadUnreadCount,
      applyUnreadCount,
    ]
  );

  const markItemRead = useCallback(
    async (itemId: string) => {
      const snapshot = data;
      const snapshotCount = unreadCount;
      setError("");
      updateItemReadState(itemId, false);
      updateUnreadCountDelta(-1);
      try {
        await markDriveboxItemRead(itemId);
        loadUnreadCount();
      } catch {
        setData(snapshot);
        applyUnreadCount(snapshotCount);
        setError("Не удалось отметить уведомление прочитанным. Повторите попытку.");
      }
    },
    [
      data,
      unreadCount,
      updateItemReadState,
      updateUnreadCountDelta,
      loadUnreadCount,
      applyUnreadCount,
    ]
  );

  const markItemUnread = useCallback(
    async (itemId: string) => {
      const snapshot = data;
      const snapshotCount = unreadCount;
      setError("");
      updateItemReadState(itemId, true);
      updateUnreadCountDelta(1);
      try {
        await markDriveboxItemUnread(itemId);
        loadUnreadCount();
      } catch {
        setData(snapshot);
        applyUnreadCount(snapshotCount);
        setError("Не удалось вернуть уведомление в непрочитанные.");
      }
    },
    [
      data,
      unreadCount,
      updateItemReadState,
      updateUnreadCountDelta,
      loadUnreadCount,
      applyUnreadCount,
    ]
  );

  // Проверяем есть ли непрочитанные элементы в текущем списке
  const hasUnreadInList = useMemo(() => {
    if (!data) return false;
    if (data.items) {
      return data.items.some((item) => item.is_unread);
    }
    if (data.groups) {
      return data.groups.some((group) => group.unread_count > 0);
    }
    return false;
  }, [data]);

  const handleMarkAllRead = async () => {
    if (markingAll) return;

    setMarkingAll(true);
    setError("");
    const snapshot = data;
    const snapshotCount = unreadCount;
    try {
      const result = await markAllDriveboxItemsRead(undefined, {
        channel,
        mine,
      });
      setHasMore(false);
      setNextOffset(0);
      applyMarkAllState();
      const nextCount =
        typeof result.unread_count === "number" ? result.unread_count : 0;
      applyUnreadCount(nextCount);
      // Перезагружаем данные
      await loadData({ offset: 0, silent: false });
      loadUnreadCount();
    } catch {
      setData(snapshot);
      applyUnreadCount(snapshotCount);
      setError("Не удалось отметить все как прочитанные. Повторите попытку.");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleRowClick = useCallback(
    async (row: DriveboxRow) => {
      setActiveRowKey(row.key);
      setSelectedDealId(row.dealId);
      
      // Отмечаем как прочитанное при клике
      if (row.isUnread && row.item) {
        try {
          await markDriveboxItemRead(row.item.id);
          updateItemReadState(row.item.id, false);
          updateUnreadCountDelta(-1);
        } catch (err) {
          console.error("Failed to mark as read", err);
        }
      } else if (row.kind === "deal" && row.unreadCount > 0) {
        try {
          await markDriveboxDealRead(row.dealId);
          updateDealReadState(row.dealId, false);
          updateUnreadCountDelta(-row.unreadCount);
        } catch (err) {
          console.error("Failed to mark deal as read", err);
        }
      }
    },
    [updateItemReadState, updateDealReadState, updateUnreadCountDelta]
  );

  const handleRowToggle = useCallback(
    async (row: DriveboxRow, event?: { stopPropagation?: () => void }) => {
      event?.stopPropagation?.();
      if (row.kind === "deal") {
        if (row.unreadCount > 0) {
          await markDealRead(row.dealId);
        } else {
          await markDealUnread(row.dealId);
        }
        return;
      }
      if (!row.item) return;
      if (row.isUnread) {
        await markItemRead(row.item.id);
      } else {
        await markItemUnread(row.item.id);
      }
    },
    [markDealRead, markDealUnread, markItemRead, markItemUnread]
  );

  const rows = useMemo<DriveboxRow[]>(() => {
    if (!data) return [];
    if (groupBy === "deal" && data.groups) {
      return data.groups.map((group) => {
        const latest = group.items[0];
        const channelValue = (latest?.channel as DriveboxChannel) ?? "unknown";
        const title = group.deal_title || `Сделка #${group.deal_id}`;
        return {
          key: `deal-${group.deal_id}`,
          dealId: group.deal_id,
          title,
          preview: resolvePreview(latest),
          channel: channelValue,
          time: group.last_event_at || latest?.created_at || "",
          unreadCount: group.unread_count,
          isUnread: group.unread_count > 0,
          kind: "deal",
          item: latest,
          group,
          fromLocation: group.from_location ?? latest?.from_location,
          toLocation: group.to_location ?? latest?.to_location,
          contactName: group.contact_name ?? latest?.contact_name,
          contactPhone: group.contact_phone ?? latest?.contact_phone,
          callStatus: latest?.call_status,
          callDirection: latest?.call_direction,
          callDurationSec: latest?.call_duration_sec,
        };
      });
    }
    if (data.items) {
      return data.items.map((item) => ({
        key: item.id,
        dealId: item.deal_id,
        title: item.title || getChannelLabel(item.channel),
        preview: resolvePreview(item),
        channel: item.channel,
        time: item.created_at,
        unreadCount: item.is_unread ? 1 : 0,
        isUnread: Boolean(item.is_unread),
        kind: "item",
        item,
        fromLocation: item.from_location,
        toLocation: item.to_location,
        contactName: item.contact_name,
        contactPhone: item.contact_phone,
        callStatus: item.call_status,
        callDirection: item.call_direction,
        callDurationSec: item.call_duration_sec,
      }));
    }
    return [];
  }, [data, groupBy]);

  const filteredRows = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((row) => {
      const haystack = `${row.title} ${row.preview} ${row.dealId}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [rows, searchValue]);

  // Кнопка активна если есть непрочитанные (по счетчику, в списке, или это фильтр "unread" с элементами)
  const canMarkAllRead = unreadCount > 0 || hasUnreadInList || (filter === "unread" && filteredRows.length > 0);

  // Virtual list for performance
  const rowVirtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  // Load more when scrolling near the end
  useEffect(() => {
    const lastItem = rowVirtualizer.getVirtualItems().at(-1);
    if (!lastItem) return;
    
    if (
      lastItem.index >= filteredRows.length - 5 &&
      hasMore &&
      !isLoadingMore
    ) {
      loadData({ append: true, offset: nextOffset });
    }
  }, [
    rowVirtualizer.getVirtualItems(),
    filteredRows.length,
    hasMore,
    isLoadingMore,
    loadData,
    nextOffset,
  ]);

  const handleListKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) {
        return;
      }
      if (!filteredRows.length) return;
      const key = event.key;
      if (!["ArrowDown", "ArrowUp", "Enter", "e", "E"].includes(key)) {
        return;
      }
      event.preventDefault();
      const currentIndex = filteredRows.findIndex(
        (row) => row.key === activeRowKey
      );
      const safeIndex = currentIndex >= 0 ? currentIndex : 0;

      if (key === "ArrowDown") {
        const nextIndex = Math.min(filteredRows.length - 1, safeIndex + 1);
        const nextRow = filteredRows[nextIndex];
        if (nextRow) {
          handleRowClick(nextRow);
          rowVirtualizer.scrollToIndex(nextIndex, { align: "auto" });
        }
        return;
      }
      if (key === "ArrowUp") {
        const nextIndex = Math.max(0, safeIndex - 1);
        const nextRow = filteredRows[nextIndex];
        if (nextRow) {
          handleRowClick(nextRow);
          rowVirtualizer.scrollToIndex(nextIndex, { align: "auto" });
        }
        return;
      }
      if (key === "Enter") {
        const row = filteredRows[safeIndex];
        if (row) {
          handleRowClick(row);
        }
        return;
      }
      if (key === "e" || key === "E") {
        const row = filteredRows[safeIndex];
        if (row) {
          void handleRowToggle(row);
        }
      }
    },
    [filteredRows, activeRowKey, handleRowClick, handleRowToggle, rowVirtualizer]
  );


  const showInlineError = Boolean(error && data);
  const emptyTitle = searchValue
    ? "Ничего не найдено"
    : filter === "unread"
      ? "Непрочитанных уведомлений нет"
      : "Сообщений пока нет";
  const emptySubtitle = searchValue
    ? "Попробуйте изменить запрос или фильтры."
    : "Новые события будут появляться здесь.";

  useEffect(() => {
    setSearchInput(queryParam);
    setSearchValue(queryParam);
  }, [queryParam]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearchValue(searchInput.trim());
    }, SEARCH_DELAY);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    if (searchValue === queryParam) return;
    updateSearchParams({ q: searchValue || undefined });
  }, [searchValue, queryParam, updateSearchParams]);

  useEffect(() => {
    setNextOffset(0);
    setHasMore(false);
    setIsLoadingMore(false);
    loadData({ offset: 0 });
  }, [filter, channel, groupBy, mine, loadData]);

  // Автоматически загружаем все оставшиеся элементы если hasMore
  // Это обеспечивает отображение всех непрочитанных
  useEffect(() => {
    if (hasMore && !isLoadingMore && !loading && nextOffset > 0) {
      const timer = setTimeout(() => {
        loadData({ append: true, offset: nextOffset });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasMore, isLoadingMore, loading, nextOffset, loadData]);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);


  const renderRow = (row: DriveboxRow, index: number) => {
    const isActive = row.key === activeRowKey;
    const dealPageUrl =
      typeof window === "undefined"
        ? `/deal/${row.dealId}`
        : `${window.location.origin}/deal/${row.dealId}`;

    const routeText = formatRoute(row.fromLocation, row.toLocation);
    const callStatusInfo = row.channel === "calls" 
      ? getCallStatusLabel(row.callStatus, row.callDirection) 
      : null;
    const callDuration = row.channel === "calls" ? formatDuration(row.callDurationSec) : "";

    // Channel avatar colors
    const avatarColors: Record<DriveboxChannel, string> = {
      telegram: "bg-gradient-to-br from-[#2AABEE] to-[#229ED9]",
      avito: "bg-gradient-to-br from-[#00AAFF] to-[#0099DD]",
      calls: "bg-gradient-to-br from-[#34C759] to-[#28A745]",
      unknown: "bg-gradient-to-br from-[#9AA4B2] to-[#6C747C]",
    };

    // Call status badge colors
    const callStatusColors: Record<string, string> = {
      missed: "bg-danger/10 text-danger",
      answered: "bg-state-positive/10 text-state-positive",
      incoming: "bg-button-primary/10 text-button-primary",
      outgoing: "bg-[#a855f7]/10 text-[#9333ea]",
    };

    return (
      <div
        key={row.key}
        data-testid={`drivebox-row-${row.dealId}`}
        className={cn(
          "group flex items-center gap-2.5 px-3 py-2 min-h-[56px] max-h-[72px]",
          "bg-surface border-b border-border/40 cursor-pointer transition-colors relative",
          "hover:bg-button-primary/5",
          "stagger-in",
          row.isUnread && "bg-button-primary/[0.04]",
          isActive && "bg-button-primary/10 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-button-primary"
        )}
        onClick={() => handleRowClick(row)}
        role="button"
        tabIndex={0}
        aria-selected={isActive}
        style={{ animationDelay: `${Math.min(index, 15) * 15}ms` }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleRowClick(row);
          }
        }}
      >
        {/* Avatar */}
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
            "text-[9px] font-bold text-white uppercase tracking-tight",
            avatarColors[row.channel]
          )}
        >
          {getChannelIcon(row.channel)}
        </div>
        
        {/* Body */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          {/* Title Row */}
          <div className="flex items-center justify-between gap-1.5">
            <span className={cn(
              "flex-1 min-w-0 text-[13px] font-semibold text-text-primary truncate flex items-center gap-1.5",
              row.isUnread && "font-bold"
            )}>
              {row.contactName || row.title}
              {callStatusInfo && (
                <span className={cn(
                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-tight",
                  callStatusColors[callStatusInfo.cssClass] || callStatusColors.incoming
                )}>
                  {callStatusInfo.label}
                  {callDuration && ` ${callDuration}`}
                </span>
              )}
            </span>
            <span className="flex-shrink-0 text-[10px] text-text-tertiary whitespace-nowrap">
              {formatTime(row.time)}
            </span>
          </div>
          
          {/* Preview */}
          <div className={cn(
            "text-xs text-text-tertiary line-clamp-1",
            row.isUnread && "text-text-secondary font-medium"
          )}>
            {row.preview}
          </div>
          
          {/* Meta */}
          <div className="flex items-center gap-1.5 flex-nowrap">
            <span className="text-[10px] text-button-primary font-medium whitespace-nowrap">
              #{row.dealId}
            </span>
            {routeText && (
              <span className="text-[10px] text-text-tertiary whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">
                {routeText}
              </span>
            )}
            {row.contactPhone && !row.contactName && (
              <span className="text-[10px] text-text-tertiary whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                {row.contactPhone}
              </span>
            )}
          </div>
        </div>
        
        {/* Right Side */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0 min-w-[50px]">
          {/* Unread Badge (shown when not hovering) */}
          <div className="group-hover:hidden">
            {row.unreadCount > 1 ? (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-button-primary text-white text-[10px] font-semibold flex items-center justify-center">
                {row.unreadCount}
              </span>
            ) : row.isUnread ? (
              <span className="w-2 h-2 rounded-full bg-button-primary" />
            ) : null}
          </div>
          
          {/* Actions (shown on hover) */}
          <div className="hidden group-hover:flex items-center gap-0.5">
            <button
              className="w-6 h-6 rounded flex items-center justify-center text-text-tertiary text-xs hover:bg-button-primary/10 hover:text-button-primary transition-colors"
              onClick={(event) => handleRowToggle(row, event)}
              type="button"
              title={
                row.isUnread || row.unreadCount > 0
                  ? "Отметить прочитанным"
                  : "Отметить непрочитанным"
              }
            >
              {row.isUnread || row.unreadCount > 0 ? "✓" : "○"}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="w-6 h-6 rounded flex items-center justify-center text-text-tertiary text-xs hover:bg-button-primary/10 hover:text-button-primary transition-colors"
                  aria-label="Действия"
                >
                  ⋯
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={6}>
                <DropdownMenuItem
                  onSelect={() => {
                    void handleRowToggle(row);
                  }}
                >
                  {row.isUnread || row.unreadCount > 0
                    ? "Отметить прочитанным"
                    : "Отметить непрочитанным"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    window.open(`/deal/${row.dealId}`, "_blank");
                  }}
                >
                  Открыть сделку в новой вкладке
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    void navigator.clipboard.writeText(dealPageUrl);
                  }}
                >
                  Копировать ссылку на сделку
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  };

  const renderRightPanel = () => {
    if (!selectedDealId) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 h-full text-text-tertiary">
          <div className="w-20 h-20 rounded-2xl bg-surface flex items-center justify-center text-4xl">
            📨
          </div>
          <p className="text-sm">
            Выберите диалог, чтобы увидеть переписку
          </p>
        </div>
      );
    }

    if (dealLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 h-full text-text-tertiary">
          <div className="w-6 h-6 border-2 border-button-primary/30 border-t-button-primary rounded-full animate-spin" />
          <p className="text-sm">Загрузка...</p>
        </div>
      );
    }

    if (dealError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 h-full">
          <p className="text-sm text-danger">{dealError}</p>
          <Button
            size="small"
            variant="secondary"
            onClick={() => loadDealDetails(selectedDealId)}
          >
            Повторить
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full min-h-0 gap-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-4 py-3 bg-surface rounded-xl border border-border flex-shrink-0">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 text-base font-semibold text-text-primary">
              <span className="truncate">{selectedDeal?.title || `Сделка #${selectedDealId}`}</span>
              {selectedDeal && (
                <Badge variant="accent" badgeSize="small">
                  {selectedDeal.from_location && selectedDeal.to_location
                    ? `${selectedDeal.from_location} → ${selectedDeal.to_location}`
                    : "Маршрут не указан"}
                </Badge>
              )}
            </div>
            <div className="text-xs text-text-tertiary truncate">
              {selectedDeal?.contact_phone || "Телефон не указан"}
              {selectedDeal?.car_make && ` · ${selectedDeal.car_make}`}
              {selectedDeal?.car_model && ` ${selectedDeal.car_model}`}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to={`/deal/${selectedDealId}`}>
              <Button size="small" variant="secondary">
                Открыть сделку
              </Button>
            </Link>
            <Button
              size="small"
              variant="tertiary"
              onClick={() => {
                setSelectedDealId(null);
                setActiveRowKey(null);
              }}
            >
              ✕
            </Button>
          </div>
        </div>
        
        {/* Timeline */}
        <div className="flex-1 min-h-0 overflow-hidden rounded-xl">
          <DriveboxTimeline
            dealId={selectedDealId}
            clientId={selectedDeal?.client_id ?? null}
            contactPhoneNormalized={selectedDeal?.contact_phone_normalized ?? null}
            headerTitle="Диалог"
            headerSubtitle={`Сделка #${selectedDealId}`}
            channelFilter={channel === "all" ? "all" : channel}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen min-h-screen w-full overflow-hidden bg-bg page-enter" data-testid="drivebox-page">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 bg-surface border-b border-border flex-shrink-0" data-testid="drivebox-topbar">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-base font-bold text-text-primary tracking-tight" data-testid="drivebox-title">Drivebox</h1>
            <p className="text-[11px] text-text-tertiary">Входящие сообщения</p>
          </div>
          {unreadCount > 0 ? (
            <Badge variant="accent">{unreadCount} новых</Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="small"
            variant="secondary"
            onClick={handleMarkAllRead}
            disabled={markingAll || !canMarkAllRead}
          >
            {markingAll ? "Обработка..." : "Отметить все прочитанным"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div ref={containerRef} className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Panel - Dialogs List */}
        <div className="flex flex-col min-h-0 overflow-hidden w-[380px] min-w-[320px] max-w-[420px] flex-shrink-0 bg-surface border-r border-border">
          {/* Search & Filters */}
          <div className="sticky top-0 z-10 flex flex-col gap-3 p-3 bg-surface border-b border-border flex-shrink-0">
            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none"
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
                className="pl-9"
                placeholder="Поиск или фильтр"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                size="small"
              />
            </div>
            
            {/* Filter Chips */}
            <div className="flex flex-col gap-2">
              {/* Read/Unread Filter */}
              <div className="flex flex-wrap gap-1">
                <button
                  className={cn(
                    "inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-medium transition-colors",
                    filter === "all"
                      ? "bg-button-primary text-white"
                      : "bg-surface-muted text-text-secondary hover:bg-button-primary/10 hover:text-button-primary"
                  )}
                  type="button"
                  onClick={() => updateSearchParams({ filter: "all" })}
                >
                  Все
                </button>
                <button
                  className={cn(
                    "inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-medium transition-colors",
                    filter === "unread"
                      ? "bg-button-primary text-white"
                      : "bg-surface-muted text-text-secondary hover:bg-button-primary/10 hover:text-button-primary"
                  )}
                  type="button"
                  onClick={() => updateSearchParams({ filter: "unread" })}
                >
                  Непрочитанные
                  {unreadCount > 0 ? (
                    <span className={cn(
                      "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold",
                      filter === "unread" ? "bg-white/25" : "bg-text-primary/10 text-text-primary"
                    )}>{unreadCount}</span>
                  ) : null}
                </button>
              </div>
              
              {/* Channel Filter */}
              <div className="flex flex-wrap gap-1">
                {[
                  { key: "all", label: "Все каналы" },
                  { key: "telegram", label: "Telegram" },
                  { key: "avito", label: "Avito" },
                  { key: "calls", label: "Звонки" },
                ].map((ch) => (
                  <button
                    key={ch.key}
                    className={cn(
                      "inline-flex items-center h-7 px-3 rounded-full text-xs font-medium transition-colors",
                      channel === ch.key
                        ? "bg-button-primary text-white"
                        : "bg-surface-muted text-text-secondary hover:bg-button-primary/10 hover:text-button-primary"
                    )}
                    type="button"
                    onClick={() => updateSearchParams({ channel: ch.key })}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
              
              {/* Toggles */}
              <div className="flex flex-wrap gap-3 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-button-primary cursor-pointer"
                    checked={mine}
                    onChange={(event) =>
                      updateSearchParams({ mine: event.target.checked ? undefined : 0 })
                    }
                  />
                  <span className="text-xs text-text-primary">Мои</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-button-primary cursor-pointer"
                    checked={groupBy === "deal"}
                    onChange={(event) =>
                      updateSearchParams({
                        groupBy: event.target.checked ? "deal" : "none",
                      })
                    }
                  />
                  <span className="text-xs text-text-primary">Группировать по сделкам</span>
                </label>
              </div>
            </div>
          </div>
          {/* Total Counter */}
          {(filteredRows.length > 0 || data?.total) && (
            <div className="px-4 py-2 text-xs text-text-tertiary border-b border-border/50 flex-shrink-0">
              Всего: <strong className="font-semibold text-text-primary">{data?.total ?? filteredRows.length}</strong>
              {unreadCount > 0 && ` · ${unreadCount} непрочитанных`}
              {hasMore && " · ..."}
            </div>
          )}
          
          {/* List */}
          <div
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-thin outline-none"
            ref={listRef}
            onKeyDown={handleListKeyDown}
            tabIndex={0}
          >
            {showInlineError ? (
              <div className="mx-4 my-3 px-3 py-2.5 rounded-md bg-danger/10 border border-danger/20 text-xs text-danger">
                {error}
              </div>
            ) : null}
            {loading ? (
              <div className="flex flex-col">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="h-14 bg-gradient-to-r from-surface-muted via-surface to-surface-muted bg-[length:200%_100%] animate-shimmer"
                  />
                ))}
              </div>
            ) : error && !data ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-muted text-text-tertiary flex items-center justify-center text-3xl">!</div>
                <div className="text-base font-semibold text-text-primary">Не удалось загрузить данные</div>
                <div className="text-sm text-text-tertiary max-w-[280px]">{error}</div>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => loadData({ offset: 0 })}
                >
                  Повторить
                </Button>
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-muted text-text-tertiary flex items-center justify-center text-3xl">📭</div>
                <div className="text-base font-semibold text-text-primary">{emptyTitle}</div>
                <div className="text-sm text-text-tertiary max-w-[280px]">{emptySubtitle}</div>
              </div>
            ) : (
              <div
                className="flex flex-col relative"
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                  const row = filteredRows[virtualItem.index];
                  return (
                    <div
                      key={virtualItem.key}
                      className="absolute top-0 left-0 w-full"
                      style={{
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      {renderRow(row, virtualItem.index)}
                    </div>
                  );
                })}
              </div>
            )}
            {isLoadingMore ? (
              <div className="flex items-center justify-center px-4 py-4 text-xs text-text-tertiary">
                <div className="w-4 h-4 border-2 border-button-primary/30 border-t-button-primary rounded-full animate-spin mr-2" />
                Загрузка...
              </div>
            ) : null}
          </div>
        </div>
        
        {/* Right Panel - Deal Context / Timeline */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden bg-bg">
          <div className="flex flex-col h-full min-h-0 p-4">
            {renderRightPanel()}
          </div>
        </div>
      </div>
    </div>
  );
}
