import type { ApiError } from "../types";

const BASE_URL = "http://localhost:3002";

// Abort requests that take longer than this to prevent hanging UI
const REQUEST_TIMEOUT_MS = 10_000;

export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

/**
 * Returns a user-facing fallback message when the server doesn't provide one.
 * Keeps error messages meaningful without leaking internal details.
 */
function statusMessage(status: number): string {
  const messages: Partial<Record<number, string>> = {
    400: "Bad request — please check your input.",
    401: "You're not authorized to do that.",
    403: "You don't have permission to perform this action.",
    404: "The requested resource was not found.",
    408: "Request timed out. Please try again.",
    409: "This conflicts with an existing record.",
    429: "Too many requests — please wait a moment and try again.",
    500: "Server error. Please try again.",
    502: "Bad gateway. The server may be starting up.",
    503: "Service unavailable. Please try again later.",
    504: "Gateway timeout. Please try again.",
  };
  return messages[status] ?? `Request failed (${status}).`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;

  // Impose a hard deadline so a slow or stalled server doesn't
  // leave the UI in an indefinite loading state.
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort("timeout"),
    REQUEST_TIMEOUT_MS,
  );

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as ApiError | null;
      throw new ApiClientError(
        body?.message ?? statusMessage(res.status),
        res.status,
      );
    }

    return res.json() as Promise<T>;
  } catch (err) {
    if (err instanceof ApiClientError) throw err;
    // AbortError covers both our timeout and any future caller-supplied signals
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiClientError(statusMessage(408), 408);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),

  patch: <T>(path: string, body: Record<string, unknown>) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),

  post: <T>(path: string, body: Record<string, unknown>) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
