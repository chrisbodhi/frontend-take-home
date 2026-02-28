import { useCallback, useMemo } from "react";
import type { AppQueryParams } from "../types";

const DEFAULTS: AppQueryParams = {
  tab: "users",
  page: 1,
  search: "",
};

function readParams(): AppQueryParams {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  const page = params.get("page");
  const search = params.get("search");

  return {
    tab: tab === "roles" ? "roles" : "users",
    page: page ? Math.max(1, parseInt(page, 10) || 1) : 1,
    search: search ?? "",
  };
}

function writeParams(next: Partial<AppQueryParams>) {
  const current = readParams();
  const merged = { ...current, ...next };

  const params = new URLSearchParams();
  if (merged.tab !== DEFAULTS.tab) params.set("tab", merged.tab);
  if (merged.page !== DEFAULTS.page) params.set("page", String(merged.page));
  if (merged.search !== DEFAULTS.search) params.set("search", merged.search);

  const qs = params.toString();
  const url = qs
    ? `${window.location.pathname}?${qs}`
    : window.location.pathname;

  window.history.replaceState(null, "", url);
}

/**
 * Reads/writes tab, page, and search to URL query params.
 *
 * Note: This deliberately does NOT use React state to avoid double-renders.
 * The URL is the source of truth; components re-render because the param
 * change triggers a data fetch via TanStack Query, which updates state naturally.
 *
 * We use `useSyncExternalStore` pattern indirectly — the caller reads params
 * and passes them to query hooks, which drive the render cycle.
 */
export function useQueryParams() {
  const params = useMemo(() => readParams(), []);

  const setParams = useCallback((next: Partial<AppQueryParams>) => {
    writeParams(next);
  }, []);

  return [params, setParams] as const;
}

/**
 * Imperative read for when you need the latest params outside of
 * the initial render (e.g. in event handlers after user interaction).
 */
export function getQueryParams(): AppQueryParams {
  return readParams();
}
