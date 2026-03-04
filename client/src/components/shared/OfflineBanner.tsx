import { useEffect, useRef, useState } from "react";
import { Flex, Text } from "@radix-ui/themes";
import {
  ExclamationTriangleIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { BASE_URL } from "../../api/client";

type BannerStatus = "online" | "offline" | "api-down" | "restored";

// Poll faster when degraded so we catch recovery quickly
const POLL_HEALTHY_MS = 30_000;
const POLL_DEGRADED_MS = 5_000;
const RESTORED_LINGER_MS = 2_500;

/**
 * Lightweight API health check. Uses HEAD so the server returns
 * only headers — no JSON body to parse, minimal bandwidth.
 * A refused connection fails immediately (no 10s timeout wait).
 */
async function pingApi(signal: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/users`, { method: "HEAD", signal });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Combines OS-level network events with active API polling into a
 * single status value the banner can render from.
 *
 * State machine:
 *   online ──(offline event)──────────────────► offline
 *   online ──(ping fails)─────────────────────► api-down
 *   offline ──(online event + ping succeeds)──► restored
 *   api-down ──(ping succeeds)────────────────► restored
 *   restored ──(2.5 s linger)─────────────────► online
 *
 * Status updates happen in event handlers or async ping callbacks —
 * never synchronously inside an effect body.
 */
function useBannerStatus(): BannerStatus {
  const [status, setStatus] = useState<BannerStatus>(() =>
    navigator.onLine ? "online" : "offline",
  );
  // Incrementing this restarts the polling effect after a network reconnect
  const [pollKey, setPollKey] = useState(0);

  const networkOnlineRef = useRef(navigator.onLine);
  const lingerRef = useRef<ReturnType<typeof setTimeout>>(null);
  // True whenever we need to show "restored" on the next successful ping
  const wasDownRef = useRef(!navigator.onLine);

  // Track OS-level connectivity — set status directly in handlers, not in effects
  useEffect(() => {
    const handleOffline = () => {
      networkOnlineRef.current = false;
      if (lingerRef.current) clearTimeout(lingerRef.current);
      wasDownRef.current = true;
      setStatus("offline");
    };
    const handleOnline = () => {
      networkOnlineRef.current = true;
      // Don't immediately show "restored" — wait for a ping to confirm the API is up
      setPollKey((k) => k + 1);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Poll the API with HEAD requests. Re-runs on pollKey change (network reconnect).
  // All setStatus calls happen inside an async callback — not synchronously in the body.
  useEffect(() => {
    if (!networkOnlineRef.current) return;

    const ac = new AbortController();
    let pollTimer: ReturnType<typeof setTimeout>;

    async function check() {
      const ok = await pingApi(ac.signal);
      if (ac.signal.aborted) return;

      if (ok) {
        if (wasDownRef.current) {
          wasDownRef.current = false;
          setStatus("restored");
          lingerRef.current = setTimeout(
            () => setStatus("online"),
            RESTORED_LINGER_MS,
          );
        } else {
          setStatus("online");
        }
      } else {
        if (lingerRef.current) clearTimeout(lingerRef.current);
        wasDownRef.current = true;
        setStatus("api-down");
      }

      pollTimer = setTimeout(check, ok ? POLL_HEALTHY_MS : POLL_DEGRADED_MS);
    }

    void check();
    return () => {
      ac.abort();
      clearTimeout(pollTimer);
    };
  }, [pollKey]);

  useEffect(() => {
    return () => {
      if (lingerRef.current) clearTimeout(lingerRef.current);
    };
  }, []);

  return status;
}

const BANNER_STYLES: Record<
  Exclude<BannerStatus, "online">,
  React.CSSProperties
> = {
  offline: { backgroundColor: "var(--amber-9)", color: "var(--amber-1)" },
  "api-down": { backgroundColor: "var(--amber-9)", color: "var(--amber-1)" },
  restored: { backgroundColor: "var(--green-9)", color: "var(--green-1)" },
};

export function OfflineBanner() {
  const status = useBannerStatus();
  const { t } = useTranslation();

  if (status === "online") return null;

  const Icon =
    status === "restored" ? CheckCircledIcon : ExclamationTriangleIcon;

  const messages: Record<Exclude<BannerStatus, "online">, string> = {
    offline: t("offlineBanner.offline"),
    "api-down": t("offlineBanner.apiDown"),
    restored: t("offlineBanner.restored"),
  };

  return (
    <Flex
      role="status"
      aria-live="polite"
      align="center"
      justify="center"
      gap="2"
      className="banner-enter"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "var(--space-2) var(--space-4)",
        ...BANNER_STYLES[status],
      }}
    >
      <Icon width={14} height={14} aria-hidden />
      <Text size="2" weight="medium">
        {messages[status]}
      </Text>
    </Flex>
  );
}
