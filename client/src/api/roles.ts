import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { apiClient } from "./client";
import type { PagedData, Role } from "../types";

// ── Query keys ──────────────────────────────────────────────────────
export const roleKeys = {
  all: ["roles"] as const,
  list: (page: number, search: string) => ["roles", { page, search }] as const,
  lookup: ["roles", "lookup"] as const,
};

// ── List roles (paginated, for the Roles tab) ──────────────────────
export function useRoles(page: number, search: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (search) params.set("search", search);
  const qs = params.toString();

  return useQuery({
    queryKey: roleKeys.list(page, search),
    queryFn: () =>
      apiClient.get<PagedData<Role>>(`/roles${qs ? `?${qs}` : ""}`),
    placeholderData: keepPreviousData,
    retry: 2,
    retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 3000),
    staleTime: 30_000,
  });
}

// ── Roles lookup (fetch all pages, cache indefinitely) ──────────────
// Used to resolve roleId → role name in the Users table without N+1.
// Fetches page-by-page until all roles are loaded.
async function fetchAllRoles(): Promise<Role[]> {
  const allRoles: Role[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const result = await apiClient.get<PagedData<Role>>(`/roles?page=${page}`);
    allRoles.push(...result.data);
    hasMore = result.next !== null;
    page++;
  }

  return allRoles;
}

export function useRolesLookup() {
  const query = useQuery({
    queryKey: roleKeys.lookup,
    queryFn: fetchAllRoles,
    staleTime: Infinity,
    retry: 3,
  });

  // Memoized map for O(1) lookups by id
  const rolesById = useMemo(() => {
    const map = new Map<string, Role>();
    if (query.data) {
      for (const role of query.data) {
        map.set(role.id, role);
      }
    }
    return map;
  }, [query.data]);

  return { ...query, rolesById };
}

// ── Rename role ─────────────────────────────────────────────────────
export function useRenameRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, name }: { roleId: string; name: string }) =>
      apiClient.patch<Role>(`/roles/${roleId}`, { name }),

    onSuccess: () => {
      // Invalidate both roles lists AND the lookup (since names changed)
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}
