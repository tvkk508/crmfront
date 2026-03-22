type RequestOptions = RequestInit & {
  json?: unknown;
};

const API_BASE = "/api";

async function request<T>(path: string, options: RequestOptions = {}) {
  const { json, headers, ...rest } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    body: json ? JSON.stringify(json) : undefined,
    ...rest,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function apiGet<T>(path: string) {
  return request<T>(path);
}

export function apiPost<T>(path: string, json?: unknown) {
  return request<T>(path, { method: "POST", json });
}

export function apiPatch<T>(path: string, json?: unknown) {
  return request<T>(path, { method: "PATCH", json });
}
