import { useEffect, useRef, useState } from "react";
import { Flex, Text } from "@radix-ui/themes";
import {
  ExclamationTriangleIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";

type NetworkStatus = "online" | "offline" | "restored";

/**
 * Tracks the browser's network connectivity and surfaces a brief
 * "back online" confirmation after reconnecting so users know their
 * session recovered.
 */
function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(
    navigator.onLine ? "online" : "offline",
  );
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const handleOnline = () => {
      setStatus("restored");
      timerRef.current = setTimeout(() => setStatus("online"), 2500);
    };
    const handleOffline = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return status;
}

const styles: Record<NetworkStatus, React.CSSProperties> = {
  online: {},
  offline: {
    backgroundColor: "var(--amber-9)",
    color: "var(--amber-1)",
  },
  restored: {
    backgroundColor: "var(--green-9)",
    color: "var(--green-1)",
  },
};

const messages: Record<Exclude<NetworkStatus, "online">, string> = {
  offline: "You're offline — changes won't be saved until you reconnect.",
  restored: "You're back online.",
};

/**
 * Fixed top banner that appears when the user loses network connectivity.
 * Uses the browser's `online`/`offline` events and briefly confirms
 * when the connection is restored.
 */
export function OfflineBanner() {
  const status = useNetworkStatus();

  if (status === "online") return null;

  const Icon =
    status === "restored" ? CheckCircledIcon : ExclamationTriangleIcon;

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
        ...styles[status],
      }}
    >
      <Icon width={14} height={14} aria-hidden />
      <Text size="2" weight="medium">
        {messages[status]}
      </Text>
    </Flex>
  );
}
