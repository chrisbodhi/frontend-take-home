// Matches server/src/models.ts — kept in sync manually since we don't alter the backend
// In an ideal world, we'd use a shared type definition file for both client and server.

export interface User {
  id: string;
  createdAt: string;
  updatedAt: string;
  first: string;
  last: string;
  roleId: string;
  photo?: string;
}

export interface Role {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description?: string;
  isDefault: boolean;
}

export interface PagedData<T> {
  data: T[];
  next: number | null;
  prev: number | null;
  pages: number;
}

/** Union of query params we sync to the URL */
export interface AppQueryParams {
  tab: "users" | "roles";
  page: number;
  search: string;
}

/** API error shape returned by the server */
export interface ApiError {
  message: string;
  status: number;
}

// For the Toast component
export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastData {
  id: string;
  type: "success" | "error" | "undo";
  message: string;
  action?: ToastAction;
  duration: number;
}
