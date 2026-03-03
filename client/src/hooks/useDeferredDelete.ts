import { useRef, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiClient } from "../api/client";
import { userKeys } from "../api/users";
import { useToast } from "./useToast";
import type { PagedData, User } from "../types";

type QuerySnapshot = [readonly unknown[], PagedData<User> | undefined][];

interface PendingDelete {
  userId: string;
  timer: ReturnType<typeof setTimeout>;
  snapshot: QuerySnapshot;
  toastId: string;
}

export function useDeferredDelete() {
  const queryClient = useQueryClient();
  const { toast, dismiss } = useToast();
  const { t } = useTranslation();
  const pendingRef = useRef<Map<string, PendingDelete>>(new Map());

  const restoreCache = useCallback(
    (snapshot: QuerySnapshot) => {
      for (const [queryKey, data] of snapshot) {
        queryClient.setQueryData(queryKey, data);
      }
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    [queryClient],
  );

  const fireDelete = useCallback(
    async (userId: string, snapshot: QuerySnapshot, toastId: string) => {
      try {
        await apiClient.delete<User>(`/users/${userId}`);
        queryClient.invalidateQueries({ queryKey: userKeys.all });
      } catch {
        // Restore on failure
        restoreCache(snapshot);
        dismiss(toastId);
        toast({ type: "error", message: t("toast.userDeleteFailed") });
      }
    },
    [queryClient, restoreCache, dismiss, toast, t],
  );

  const deferredDelete = useCallback(
    async (userId: string, userName: string) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: userKeys.all });

      // Snapshot cache
      const snapshot = queryClient.getQueriesData<PagedData<User>>({
        queryKey: userKeys.all,
      });

      // Optimistically remove user
      queryClient.setQueriesData<PagedData<User>>(
        { queryKey: userKeys.all },
        (old) => {
          if (!old) return old;
          return { ...old, data: old.data.filter((u) => u.id !== userId) };
        },
      );

      // Show undo toast
      const toastId = toast({
        type: "undo",
        message: t("toast.userDeleted", { name: userName }),
        action: {
          label: t("toast.undo"),
          onClick: () => {
            // Undo: cancel timer, restore cache
            const pending = pendingRef.current.get(userId);
            if (pending) {
              clearTimeout(pending.timer);
              pendingRef.current.delete(userId);
            }
            dismiss(toastId);
            restoreCache(snapshot);
            toast({ message: t("toast.userDeleteUndone") });
          },
        },
        duration: 5000,
      });

      // Start 5s timer
      const timer = setTimeout(() => {
        pendingRef.current.delete(userId);
        dismiss(toastId);
        fireDelete(userId, snapshot, toastId);
      }, 5000);

      pendingRef.current.set(userId, { userId, timer, snapshot, toastId });
    },
    [queryClient, toast, dismiss, restoreCache, fireDelete, t],
  );

  // Cleanup on unmount: cancel timers, restore cache
  useEffect(() => {
    const pending = pendingRef.current;
    return () => {
      for (const { timer, snapshot } of pending.values()) {
        clearTimeout(timer);
        // Restore cache for any pending deletes
        for (const [queryKey, data] of snapshot) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      pending.clear();
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    };
  }, [queryClient]);

  return { deferredDelete };
}
