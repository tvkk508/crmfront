import type {
  Deal,
  DealPayload,
  DealsResponse,
  Pipeline,
  Stage,
  TransportAnalytics,
  TransportAnalyticsFilters,
  GroupedCarrierSearchResponse,
  CarrierDetails,
  TelegramStatus,
  TelegramLink,
  TelegramMessage,
  UnifiedMessagesResponse,
  CommunicationEvent,
  Client,
  DriveboxResponse,
  AuthUser,
  Task,
  TaskType,
  TaskGroupResponse,
} from "./types";
import { getAuthToken } from "../auth/storage";

type LogLevel = "INFO" | "ERROR" | "WARN";

const getApiBase = () => {
  const envApiUrl = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL;
  if (envApiUrl) return envApiUrl;

  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return "/api";
  }

  return "http://localhost:4000/api";
};

export const API_BASE = getApiBase();

if (typeof window !== "undefined") {
  console.log("[CLIENT] API_BASE:", API_BASE, {
    hostname: window.location.hostname,
    env: (import.meta as { env?: { MODE?: string; VITE_API_URL?: string } }).env?.MODE,
    vite_api_url: (import.meta as { env?: { MODE?: string; VITE_API_URL?: string } }).env?.VITE_API_URL,
  });
}

const log = (level: LogLevel, message: string, data?: unknown) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] [CLIENT] ${message}`;
  if (data !== undefined) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
};

const handle = async <T>(res: Response): Promise<T> => {
  if (res.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  }
  if (!res.ok) {
    let body: { error?: unknown; detail?: unknown } = {};
    try {
      body = (await res.json()) as { error?: unknown; detail?: unknown };
    } catch {
      // ignore JSON parse errors
    }

    const errorText = typeof body.error === "string" ? body.error : res.statusText;
    log("ERROR", "API request failed", {
      status: res.status,
      statusText: res.statusText,
      error: body.error,
      detail: body.detail,
      url: res.url,
    });

    throw new Error(typeof errorText === "string" ? errorText : "request_failed");
  }

  return res.json() as Promise<T>;
};

const safeFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  try {
    log("INFO", "fetch request", { url, method: options?.method ?? "GET" });
    const token = getAuthToken();
    const headers = {
      ...(options?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    return await fetch(url, { ...(options ?? {}), headers });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    if (error.message?.includes("blocked") || error.name === "TypeError") {
      log("ERROR", "fetch blocked by browser or network", {
        url,
        error: error.message,
        name: error.name,
      });
      throw new Error("request_blocked_by_browser");
    }
    throw error;
  }
};

export const fetchPipelines = () => {
  const url = `${API_BASE}/pipelines`;
  log("INFO", "fetch pipelines", { url, api_base: API_BASE });

  return safeFetch(url)
    .then((res) => {
      log("INFO", "pipelines response", {
        status: res.status,
        ok: res.ok,
        url: res.url,
      });
      return handle<Pipeline[]>(res);
    })
    .catch((err) => {
      log("ERROR", "pipelines request failed", {
        error: err instanceof Error ? err.message : String(err),
        url,
        api_base: API_BASE,
      });
      throw err;
    });
};

export const fetchStages = (pipelineId: number) => {
  const url = `${API_BASE}/pipelines/${pipelineId}/stages`;
  return safeFetch(url).then((res) => handle<Stage[]>(res));
};

export const fetchDeals = (params: {
  pipelineId: number;
  stageIds?: number[];
  q?: string;
  offset?: number;
  limit?: number;
  responsibleUserId?: number;
}) => {
  const search = new URLSearchParams();
  search.set("pipeline_id", String(params.pipelineId));
  if (params.q) search.set("q", params.q);
  if (params.stageIds && params.stageIds.length) {
    search.set("stage_id", params.stageIds.join(","));
  }
  if (params.responsibleUserId) {
    search.set("responsible_user_id", String(params.responsibleUserId));
  }
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  if (params.limit !== undefined) search.set("limit", String(params.limit));

  const url = `${API_BASE}/deals?${search.toString()}`;
  return safeFetch(url).then((res) => handle<DealsResponse>(res));
};

export const fetchDealById = (id: number) => {
  const url = `${API_BASE}/deals/${id}`;
  return safeFetch(url).then((res) => handle<Deal>(res));
};

export const createDeal = (payload: DealPayload) => {
  log("INFO", "create deal", {
    title: payload.title,
    pipeline_id: payload.pipeline_id,
    stage_id: payload.stage_id,
  });

  return safeFetch(`${API_BASE}/deals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) => {
      log("INFO", "create deal response", {
        status: res.status,
        ok: res.ok,
      });
      return handle<Deal>(res);
    })
    .then((deal) => {
      log("INFO", "deal created", {
        deal_id: deal.id,
        title: deal.title,
      });
      return deal;
    })
    .catch((err) => {
      log("ERROR", "create deal failed", {
        error: err instanceof Error ? err.message : String(err),
        payload: { title: payload.title, pipeline_id: payload.pipeline_id, stage_id: payload.stage_id },
      });
      throw err;
    });
};

export const updateDeal = (id: number, payload: Partial<DealPayload> & { position?: number }) => {
  log("INFO", "update deal", {
    deal_id: id,
    update_keys: Object.keys(payload),
  });

  return safeFetch(`${API_BASE}/deals/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) => {
      log("INFO", "update deal response", {
        status: res.status,
        ok: res.ok,
      });
      return handle<Deal>(res);
    })
    .then((deal) => {
      log("INFO", "deal updated", {
        deal_id: deal.id,
        title: deal.title,
      });
      return deal;
    })
    .catch((err) => {
      log("ERROR", "update deal failed", {
        deal_id: id,
        error: err instanceof Error ? err.message : String(err),
        update_keys: Object.keys(payload),
      });
      throw err;
    });
};

export const deleteDeal = (id: number) => {
  const url = `${API_BASE}/deals/${id}`;
  return safeFetch(url, { method: "DELETE" }).then((res) => {
    if (!res.ok) {
      throw new Error("failed_to_delete");
    }
  });
};

export const fetchTransportAnalytics = (filters: TransportAnalyticsFilters) => {
  const search = new URLSearchParams();
  search.set("date_from", filters.dateFrom);
  search.set("date_to", filters.dateTo);
  search.set("bucket", filters.bucket);
  if (filters.datePreset) search.set("date_preset", filters.datePreset);
  if (filters.carMake) search.set("car_make", filters.carMake);
  if (filters.carModel) search.set("car_model", filters.carModel);
  if (filters.origin) search.set("origin", filters.origin);
  if (filters.destination) search.set("destination", filters.destination);
  if (filters.carrier) search.set("carrier", filters.carrier);

  const url = `${API_BASE}/transport/analytics?${search.toString()}`;
  return safeFetch(url).then((res) => handle<TransportAnalytics>(res));
};

const buildRouteSearchUrl = (from: string, to: string) => {
  const search = new URLSearchParams();
  search.set("from", from);
  search.set("to", to);
  return `${API_BASE}/search/routes?${search.toString()}`;
};

export const searchCarriersGrouped = (from: string, to: string) =>
  safeFetch(buildRouteSearchUrl(from, to)).then((res) => handle<GroupedCarrierSearchResponse>(res));

export const fetchCarrierDetails = (carrierId: string, params?: { from?: string; to?: string }) => {
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  const suffix = search.toString() ? `?${search.toString()}` : "";
  return safeFetch(`${API_BASE}/carriers/${encodeURIComponent(carrierId)}${suffix}`).then((res) =>
    handle<CarrierDetails>(res)
  );
};

// ======== Telegram API ========

export const getTelegramStatus = (dealId: number) => {
  return safeFetch(`${API_BASE}/telegram/deals/${dealId}/status`).then((res) =>
    handle<{ ok: boolean } & TelegramStatus>(res)
  );
};

export const generateTelegramLink = (dealId: number) => {
  return safeFetch(`${API_BASE}/telegram/deals/${dealId}/link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  }).then((res) => handle<{ ok: boolean } & TelegramLink>(res));
};

export const getTelegramMessages = (dealId: number) => {
  return safeFetch(`${API_BASE}/telegram/deals/${dealId}/messages`).then((res) =>
    handle<{ telegram_chat_id: number | null; messages: TelegramMessage[] }>(res)
  );
};

export const sendTelegramMessage = (dealId: number, text: string, managerUserId?: number) => {
  return safeFetch(`${API_BASE}/telegram/deals/${dealId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, manager_user_id: managerUserId }),
  }).then((res) => handle<{ ok: boolean; message?: TelegramMessage }>(res));
};

// ======== Unified Messages API ========

export const getUnifiedMessages = (dealId: number) => {
  return safeFetch(`${API_BASE}/deals/${dealId}/messages`).then((res) =>
    handle<UnifiedMessagesResponse>(res)
  );
};

export const sendUnifiedMessage = (
  dealId: number,
  text: string,
  channel?: "avito" | "telegram" | "auto",
  managerUserId?: number
) => {
  return safeFetch(`${API_BASE}/deals/${dealId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, channel: channel || "auto", manager_user_id: managerUserId }),
  }).then((res) => handle<{ ok: boolean; result: any }>(res));
};

// ======== Sipuni Integration ========
export const initiateSipuniCall = (payload: {
  client_id: number;
  deal_id?: number | null;
  phone?: string;
  sipnumber?: string;
}) => {
  return safeFetch(`${API_BASE}/sipuni/call`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => handle<{ ok: boolean; call?: any; sipuniResponse?: any }>(res));
};

export const fetchCommunications = (params: {
  client_id?: number;
  deal_id?: number;
  phone?: string;
  limit?: number;
  signal?: AbortSignal;
}) => {
  const search = new URLSearchParams();
  if (params.client_id) search.set("client_id", String(params.client_id));
  if (params.deal_id) search.set("deal_id", String(params.deal_id));
  if (params.phone) search.set("phone", params.phone);
  if (params.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  const url = `${API_BASE}/communications${qs ? `?${qs}` : ""}`;
  return safeFetch(url, params.signal ? { signal: params.signal } : undefined).then((res) =>
    handle<{ items: CommunicationEvent[] }>(res)
  );
};

export const fetchCallTranscript = (callId: number) => {
  return safeFetch(`${API_BASE}/calls/${callId}/transcript`).then((res) =>
    handle<{ ok: boolean; transcript_text?: string | null; transcript_status?: string | null }>(res)
  );
};

// ======== Clients ========
export const fetchClient = (clientId: number) => {
  return safeFetch(`${API_BASE}/clients/${clientId}`).then((res) => handle<Client>(res));
};

export const updateClient = (
  clientId: number,
  payload: {
    name?: string;
    phone?: string;
    email?: string;
    company?: string;
    company_name?: string;
    avito_user_id?: number;
    avito_profile?: string;
    telegram_id?: number;
    telegram_username?: string;
    birth_date?: string;
    passport?: string;
    passport_issue_date?: string;
    passport_issuer_code?: string;
    user_agreement?: boolean;
  }
) => {
  return safeFetch(`${API_BASE}/clients/${clientId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => handle<Client>(res));
};

export const createClient = (payload: {
  name?: string | null;
  phone: string;
  email?: string | null;
  company?: string | null;
  company_name?: string | null;
  avito_user_id?: number | null;
  avito_profile?: string | null;
  telegram_id?: number | null;
  telegram_username?: string | null;
  birth_date?: string | null;
  passport?: string | null;
  passport_issue_date?: string | null;
  passport_issuer_code?: string | null;
  user_agreement?: boolean | null;
}) => {
  return safeFetch(`${API_BASE}/clients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => handle<Client>(res));
};

export const updateDealContacts = (dealId: number, payload: { contact_phone?: string | null; client_id?: number | null }) => {
  return safeFetch(`${API_BASE}/deals/${dealId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => handle<any>(res));
};

// ======== Drivebox API ========

export const fetchDrivebox = (params: {
  filter?: "all" | "unread";
  channel?: "all" | "telegram" | "avito" | "calls";
  groupBy?: "none" | "deal";
  mine?: boolean;
  limit?: number;
  offset?: number;
  user_id?: number;
}) => {
  const search = new URLSearchParams();
  if (params.filter) search.set("filter", params.filter);
  if (params.channel) search.set("channel", params.channel);
  if (params.groupBy) search.set("groupBy", params.groupBy);
  if (params.mine !== undefined) search.set("mine", String(params.mine ? 1 : 0));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  if (params.user_id) search.set("user_id", String(params.user_id));
  const qs = search.toString();
  const url = `${API_BASE}/drivebox${qs ? `?${qs}` : ""}`;
  return safeFetch(url).then((res) => handle<DriveboxResponse>(res));
};

export const getDriveboxUnreadCount = (userId?: number) => {
  const search = new URLSearchParams();
  if (userId) search.set("user_id", String(userId));
  const qs = search.toString();
  return safeFetch(`${API_BASE}/drivebox/unread-count${qs ? `?${qs}` : ""}`).then((res) =>
    handle<{ unread_count: number }>(res)
  );
};

export const markDriveboxItemRead = (itemId: string, userId?: number) => {
  return safeFetch(`${API_BASE}/drivebox/${itemId}/read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userId ? { user_id: userId } : {}),
  }).then((res) => handle<{ ok: boolean }>(res));
};

export const markDriveboxItemUnread = (itemId: string, userId?: number) => {
  return safeFetch(`${API_BASE}/drivebox/${itemId}/unread`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userId ? { user_id: userId } : {}),
  }).then((res) => handle<{ ok: boolean }>(res));
};

export const markDriveboxDealRead = (dealId: number, userId?: number) => {
  return safeFetch(`${API_BASE}/drivebox/deal/${dealId}/read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userId ? { user_id: userId } : {}),
  }).then((res) => handle<{ ok: boolean; updated_count: number; unread_count: number }>(res));
};

export const markDriveboxDealUnread = (dealId: number, userId?: number) => {
  return safeFetch(`${API_BASE}/drivebox/deal/${dealId}/unread`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userId ? { user_id: userId } : {}),
  }).then((res) => handle<{ ok: boolean; updated_count: number; unread_count: number }>(res));
};

export const markAllDriveboxItemsRead = (
  userId?: number,
  filters?: {
    channel?: "all" | "telegram" | "avito" | "calls";
    mine?: boolean;
  }
) => {
  return safeFetch(`${API_BASE}/drivebox/read-all`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      ...(userId ? { user_id: userId } : {}),
      channel: filters?.channel,
      mine: filters?.mine,
    }),
  }).then((res) => handle<{ ok: boolean; updated_count: number; unread_count: number }>(res));
};

// ======== Auth & Users ========

export const login = (loginValue: string, password: string) => {
  return safeFetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login: loginValue, password }),
  }).then((res) => handle<{ token: string; user: AuthUser }>(res));
};

export const fetchMe = () => {
  return safeFetch(`${API_BASE}/auth/me`).then((res) => handle<{ user: AuthUser }>(res));
};

export const logout = () => {
  return safeFetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  }).then((res) => handle<{ ok: boolean }>(res));
};

export const fetchUsers = () => {
  return safeFetch(`${API_BASE}/users`).then((res) => handle<{ users: AuthUser[] }>(res));
};

export const fetchPublicUsers = () => {
  return safeFetch(`${API_BASE}/users/public`).then((res) => handle<{ users: Array<{ id: number; name: string }> }>(res));
};

export const updateUserRole = (id: number, role: "admin" | "user") => {
  return safeFetch(`${API_BASE}/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  }).then((res) => handle<{ user: AuthUser }>(res));
};

export const resetUserPassword = (id: number, password: string) => {
  return safeFetch(`${API_BASE}/users/${id}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  }).then((res) => handle<{ ok: boolean }>(res));
};

// ======== Tasks API ========
export const fetchTaskTypes = () => {
  return safeFetch(`${API_BASE}/task-types`).then((res) => handle<{ task_types: TaskType[] }>(res));
};

export const fetchTasks = (params?: {
  responsible_id?: number;
  status?: "open" | "completed" | "canceled";
  entity_type?: "deal" | "contact" | "company";
  entity_id?: number;
  type_id?: number;
  from?: string;
  to?: string;
  group_by_due?: boolean;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.responsible_id !== undefined) {
    searchParams.set("responsible_id", String(params.responsible_id));
  }
  if (params?.status) {
    searchParams.set("status", params.status);
  }
  if (params?.entity_type) {
    searchParams.set("entity_type", params.entity_type);
  }
  if (params?.entity_id !== undefined) {
    searchParams.set("entity_id", String(params.entity_id));
  }
  if (params?.type_id !== undefined) {
    searchParams.set("type_id", String(params.type_id));
  }
  if (params?.from) {
    searchParams.set("from", params.from);
  }
  if (params?.to) {
    searchParams.set("to", params.to);
  }
  if (params?.group_by_due) {
    searchParams.set("group_by_due", "1");
  }

  const url = `${API_BASE}/tasks${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  return safeFetch(url).then((res) => handle<TaskGroupResponse | { tasks: Task[] }>(res));
};

export const fetchTaskById = (id: number) => {
  return safeFetch(`${API_BASE}/tasks/${id}`).then((res) => handle<{ task: Task }>(res));
};

export const createTask = (payload: {
  task_type_id: number;
  responsible_user_id: number;
  entity_type: "deal" | "contact" | "company";
  entity_id: number;
  text: string;
  due_at: string | number | Date;
}) => {
  return safeFetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      due_at: payload.due_at instanceof Date ? payload.due_at.toISOString() : payload.due_at,
    }),
  }).then((res) => handle<{ task: Task }>(res));
};

export const updateTask = (
  id: number,
  payload: {
    task_type_id?: number;
    responsible_user_id?: number;
    text?: string;
    due_at?: string | number | Date;
    status?: "open" | "completed" | "canceled";
    result_text?: string | null;
  }
) => {
  return safeFetch(`${API_BASE}/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      due_at: payload.due_at instanceof Date ? payload.due_at.toISOString() : payload.due_at,
    }),
  }).then((res) => handle<{ task: Task }>(res));
};

export const completeTask = (id: number, resultText?: string | null) => {
  return safeFetch(`${API_BASE}/tasks/${id}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ result_text: resultText ?? null }),
  }).then((res) => handle<{ task: Task }>(res));
};

export const rescheduleTask = (id: number, mode: "tomorrow" | "week" | "month") => {
  return safeFetch(`${API_BASE}/tasks/${id}/reschedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode }),
  }).then((res) => handle<{ task: Task }>(res));
};

export const deleteTask = (id: number) => {
  return safeFetch(`${API_BASE}/tasks/${id}`, {
    method: "DELETE",
  }).then((res) => handle<void>(res));
};

// ======== Manager Stats API ========
export interface ManagerStats {
  cars_in_transit: number;
  total_deals: number;
  money_in_transit: number;
  money_earned: number;
}

export const fetchManagerStats = (userId?: number) => {
  const url = userId
    ? `${API_BASE}/manager/stats?user_id=${userId}`
    : `${API_BASE}/manager/stats`;
  return safeFetch(url).then((res) => handle<{ stats: ManagerStats }>(res));
};

export const getAiAgentSetting = () =>
  safeFetch(`${API_BASE}/settings/ai-agent`).then((res) => handle<{ enabled: boolean }>(res));

export const setAiAgentSetting = (enabled: boolean) =>
  safeFetch(`${API_BASE}/settings/ai-agent`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  }).then((res) => handle<{ enabled: boolean }>(res));
