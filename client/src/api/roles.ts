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
    retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 3000),
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

    onMutate: async ({ roleId, name }) => {
      // Prevent in-flight refetches from overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: roleKeys.all });

      // Snapshot every "roles" cache entry for rollback on error
      const snapshot = queryClient.getQueriesData({ queryKey: roleKeys.all });

      const patchRole = (role: Role) =>
        role.id === roleId ? { ...role, name } : role;

      // Optimistically update all paginated list caches
      queryClient.setQueriesData<PagedData<Role>>(
        { queryKey: roleKeys.all },
        (old) => {
          if (!old || !("data" in old)) return old; // skip non-list shapes
          return { ...old, data: old.data.map(patchRole) };
        },
      );

      // Optimistically update the lookup cache (Role[], not PagedData)
      queryClient.setQueryData<Role[]>(roleKeys.lookup, (old) =>
        old?.map(patchRole),
      );

      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      // Roll back every cache to its pre-mutation snapshot
      context?.snapshot.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },

    onSettled: () => {
      // Always sync with server truth, success or failure
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}
