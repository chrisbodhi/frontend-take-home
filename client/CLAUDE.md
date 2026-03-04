# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Dev server at http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint     # ESLint
npm run test     # Vitest (run mode, no watch)

npx vitest                                  # Watch mode
npx vitest run src/api/roles.test.ts        # Single file
npx vitest run --grep "patches the cache"   # Single test by name
```

The API server must be running before the app works: `npm run api` from `../server/`.

## Architecture

**No router.** Tab, page, and search are synced to URL query params via `useQueryParams` (`src/hooks/useQueryParams.ts`). Switching tabs resets page and search.

**API layer** (`src/api/`):
- `client.ts` — fetch wrapper with 10s AbortController timeout, `ApiClientError`, `BASE_URL = "http://localhost:3002"`
- `users.ts` / `roles.ts` — TanStack Query hooks with structured query keys (`userKeys.*`, `roleKeys.*`)
- `useRolesLookup()` fetches all role pages and returns a `Map<id, role>` with `staleTime: Infinity` for O(1) role name lookups across the user table

**Optimistic mutations** follow a consistent pattern: snapshot cache in `onMutate` → update cache immediately → rollback in `onError` → invalidate/refetch in `onSettled`. Both `useDeleteUser` and `useRenameRole` follow this.

**Deferred delete** (`src/hooks/useDeferredDelete.ts`): On delete, shows a 5s toast with an Undo button. The actual API call is deferred by `setTimeout`. On unmount, pending timers are cleared and caches are restored to prevent orphaned deletes.

**Offline/API health** (`src/components/shared/OfflineBanner.tsx`): Combines `window.online`/`window.offline` events with HEAD polling of `/users` (30s interval when healthy, 5s when degraded). Distinguishes OS-offline from API-down states.

**i18n:** All user-facing strings live in `src/locales/en.json`. Use `useTranslation()` for any new strings.

**Shared components** (`src/components/shared/`): ErrorBanner, ErrorBoundary, OfflineBanner, Toast, SearchInput, TableSkeleton, TablePaginationRow, ThemeToggle. Reuse these before creating new UI primitives.

**CSS animations** are centralized in `src/animations.css` and include `prefers-reduced-motion` overrides.

## TypeScript

Strict mode with `noUnusedLocals` and `noUnusedParameters`. Core domain types (User, Role, PagedData, AppQueryParams, ApiError) are in `src/types.ts`.

## Testing

Tests use Vitest + jsdom + `@testing-library/react`. Create a fresh `QueryClient` per test and wrap hooks with a `QueryClientProvider`. Mock API calls with `vi.spyOn(apiClient, "method")`. See `src/api/roles.test.ts` for the pattern.

## Dependencies

ALWAYS install exact versions of dependencies, NEVER a range of versions.

## Workflows

Ensure linting with `npm run lint` and building with `npm run build` succeed before calling a task complete.
