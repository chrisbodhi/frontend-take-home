import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useRenameRole, roleKeys } from "./roles";
import { apiClient } from "./client";
import type { PagedData, Role } from "../types";

const ROLE: Role = {
  id: "role-1",
  name: "Admin",
  description: "Administrator",
  isDefault: false,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (err: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useRenameRole — optimistic update", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = makeClient();
    vi.restoreAllMocks();
  });

  it("patches the cache immediately and rolls back on error", async () => {
    // Seed the list + lookup caches with the initial role
    const listData: PagedData<Role> = {
      data: [ROLE],
      next: null,
      prev: null,
      pages: 1,
    };
    queryClient.setQueryData(roleKeys.list(1, ""), listData);
    queryClient.setQueryData(roleKeys.lookup, [ROLE]);

    // Hold the API response so we can inspect the optimistic state
    const deferred = createDeferred<Role>();
    vi.spyOn(apiClient, "patch").mockReturnValue(deferred.promise);

    const { result } = renderHook(() => useRenameRole(), {
      wrapper: makeWrapper(queryClient),
    });

    // Fire the mutation
    act(() => {
      result.current.mutate({ roleId: "role-1", name: "Super Admin" });
    });

    // Optimistic update must be visible before the server responds
    await waitFor(() => {
      const list = queryClient.getQueryData<PagedData<Role>>(
        roleKeys.list(1, ""),
      );
      expect(list?.data[0].name).toBe("Super Admin");
    });

    // Lookup cache must be patched too
    expect(queryClient.getQueryData<Role[]>(roleKeys.lookup)?.[0].name).toBe(
      "Super Admin",
    );

    // Server fails — onError should roll back both caches
    await act(async () => {
      deferred.reject(new Error("Server error"));
      // Let the promise rejection propagate through TanStack Query's pipeline
      await Promise.resolve();
    });

    await waitFor(() => {
      const list = queryClient.getQueryData<PagedData<Role>>(
        roleKeys.list(1, ""),
      );
      expect(list?.data[0].name).toBe("Admin");
    });

    expect(queryClient.getQueryData<Role[]>(roleKeys.lookup)?.[0].name).toBe(
      "Admin",
    );
  });

  it("keeps the optimistic name when the server succeeds", async () => {
    const listData: PagedData<Role> = {
      data: [ROLE],
      next: null,
      prev: null,
      pages: 1,
    };
    queryClient.setQueryData(roleKeys.list(1, ""), listData);
    queryClient.setQueryData(roleKeys.lookup, [ROLE]);

    const deferred = createDeferred<Role>();
    vi.spyOn(apiClient, "patch").mockReturnValue(deferred.promise);

    const { result } = renderHook(() => useRenameRole(), {
      wrapper: makeWrapper(queryClient),
    });

    act(() => {
      result.current.mutate({ roleId: "role-1", name: "Super Admin" });
    });

    // Optimistic name is visible
    await waitFor(() => {
      expect(
        queryClient.getQueryData<PagedData<Role>>(roleKeys.list(1, ""))?.data[0]
          .name,
      ).toBe("Super Admin");
    });

    // Server confirms the rename
    await act(async () => {
      deferred.resolve({ ...ROLE, name: "Super Admin" });
      await Promise.resolve();
    });

    // After success the optimistic name should still be there
    // (onSettled invalidates, but no active observers → no refetch in tests)
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(
      queryClient.getQueryData<PagedData<Role>>(roleKeys.list(1, ""))?.data[0]
        .name,
    ).toBe("Super Admin");
  });
});
