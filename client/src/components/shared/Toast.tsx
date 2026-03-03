import * as RadixToast from "@radix-ui/react-toast";
import { Flex, Text } from "@radix-ui/themes";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { useToast } from "../../hooks/useToast";
import { type ToastData } from "../../types";
import "./Toast.css";

// ── Single Toast ─────────────────────────────────────────────────────

function Toast({ data }: { data: ToastData }) {
  const { dismiss } = useToast();
  const { t } = useTranslation();

  const icon =
    data.type === "success" ? (
      <CheckCircledIcon width="18" height="18" />
    ) : data.type === "error" ? (
      <CrossCircledIcon width="18" height="18" />
    ) : null;

  const colorMap = { success: "green", error: "red", undo: "iris" } as const;

  return (
    <RadixToast.Root
      className={`toast toast--${data.type}`}
      open
      onOpenChange={(open) => {
        if (!open) dismiss(data.id);
      }}
      duration={0}
    >
      <Flex align="center" gap="3" justify="between">
        <Flex align="center" gap="2" style={{ minWidth: 0 }}>
          {icon && (
            <Text
              color={colorMap[data.type]}
              style={{ flexShrink: 0, display: "flex" }}
            >
              {icon}
            </Text>
          )}
          <RadixToast.Description asChild>
            <Text size="2" weight="medium" style={{ minWidth: 0 }}>
              {data.message}
            </Text>
          </RadixToast.Description>
        </Flex>

        <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
          {data.action && (
            <RadixToast.Action altText={data.action.label} asChild>
              <button className="toast-action" onClick={data.action.onClick}>
                <Text size="2" weight="bold">
                  {data.action.label}
                </Text>
              </button>
            </RadixToast.Action>
          )}
          <RadixToast.Close aria-label={t("toast.dismiss")} asChild>
            <button className="toast-close">
              <Cross2Icon />
            </button>
          </RadixToast.Close>
        </Flex>
      </Flex>

      {data.type === "undo" && (
        <div
          className="toast-progress"
          style={
            { "--toast-duration": `${data.duration}ms` } as React.CSSProperties
          }
        />
      )}
    </RadixToast.Root>
  );
}

// ── Toast Viewport ──────────────────────────────────────────────────

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <>
      {toasts.map((t) => (
        <Toast key={t.id} data={t} />
      ))}
      <RadixToast.Viewport className="toast-viewport" />
    </>
  );
}
