import { Tooltip } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import type { ReactElement } from "react";

interface ComingSoonTooltipProps {
  children: ReactElement;
}

export function ComingSoonTooltip({ children }: ComingSoonTooltipProps) {
  const { t } = useTranslation();
  return <Tooltip content={t("comingSoon.tooltip")}>{children}</Tooltip>;
}
