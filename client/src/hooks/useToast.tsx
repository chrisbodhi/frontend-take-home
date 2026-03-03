import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import * as RadixToast from "@radix-ui/react-toast";

import { type ToastAction, type ToastData } from "../types";

type ToastOptions = {
  type?: ToastData["type"];
  message: string;
  action?: ToastAction;
  duration?: number;
};

const DEFAULT_DURATIONS: Record<ToastData["type"], number> = {
  success: 4000,
  error: 6000,
  undo: 5000,
};

const MAX_VISIBLE = 3;

// ── Reducer ──────────────────────────────────────────────────────────

type State = ToastData[];

type Action =
  | { type: "ADD"; toast: ToastData }
  | { type: "REMOVE"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD":
      // Keep max visible — drop oldest if needed
      return [...state, action.toast].slice(-MAX_VISIBLE);
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────────────

interface ToastContextValue {
  toasts: ToastData[];
  toast: (opts: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, dispatch] = useReducer(reducer, []);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const dismiss = useCallback((id: string) => {
    // Clear the auto-dismiss timer
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    dispatch({ type: "REMOVE", id });
  }, []);

  const toast = useCallback(
    (opts: ToastOptions): string => {
      const id = crypto.randomUUID();
      const type = opts.type ?? "success";
      const duration = opts.duration ?? DEFAULT_DURATIONS[type];

      dispatch({
        type: "ADD",
        toast: {
          id,
          type,
          message: opts.message,
          action: opts.action,
          duration,
        },
      });

      // Auto-dismiss
      const timer = setTimeout(() => {
        timersRef.current.delete(id);
        dismiss(id);
      }, duration);
      timersRef.current.set(id, timer);

      return id;
    },
    [dismiss],
  );

  // Cleanup all timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  return (
    <RadixToast.Provider swipeDirection="right">
      <ToastContext.Provider value={{ toasts, toast, dismiss }}>
        {children}
      </ToastContext.Provider>
    </RadixToast.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
