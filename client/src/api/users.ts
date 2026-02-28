import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { apiClient } from "./client";
import type { PagedData, User } from "../types";

// ── Query keys ──────────────────────────────────────────────────────
export const userKeys = {
  all: ["users"] as const,
  list: (page: number, search: string) => ["users", { page, search }] as const,
};

// ── List users (paginated + searchable) ─────────────────────────────
export function useUsers(page: number, search: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (search) params.set("search", search);
  const qs = params.toString();

  return useQuery({
    queryKey: userKeys.list(page, search),
    queryFn: () =>
      apiClient.get<PagedData<User>>(`/users${qs ? `?${qs}` : ""}`),
    // Keep showing previous page data while fetching next page
    placeholderData: keepPreviousData,
    // Retry twice to handle the server's random 500s
    retry: 2,
    retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 3000),
    staleTime: 30_000,
  });
}

// ── Delete user (optimistic) ────────────────────────────────────────
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => apiClient.delete<User>(`/users/${userId}`),

    // Optimistic update: remove the user from all cached pages immediately
    onMutate: async (userId) => {
      // Cancel in-flight fetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: userKeys.all });

      // Snapshot all current user list queries for rollback
      const previousQueries = queryClient.getQueriesData<PagedData<User>>({
        queryKey: userKeys.all,
      });

      // Optimistically remove the user from every cached page
      queryClient.setQueriesData<PagedData<User>>(
        { queryKey: userKeys.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((u) => u.id !== userId),
          };
        },
      );

      return { previousQueries };
    },

    // On error, roll back to the snapshot
    onError: (_err, _userId, context) => {
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },

    // Always refetch after to ensure server state is in sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
