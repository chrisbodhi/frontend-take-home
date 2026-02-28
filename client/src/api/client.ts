import type { ApiError } from "../types";

const BASE_URL = "http://localhost:3002";

class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiError | null;
    throw new ApiClientError(
      body?.message ?? `Request failed: ${res.status}`,
      res.status,
    );
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),

  patch: <T>(path: string, body: Record<string, unknown>) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),

  post: <T>(path: string, body: Record<string, unknown>) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export { ApiClientError };
