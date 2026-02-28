import { IconButton, Tooltip } from "@radix-ui/themes";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";

interface ThemeToggleProps {
  appearance: "light" | "dark";
  onToggle: () => void;
}

export function ThemeToggle({ appearance, onToggle }: ThemeToggleProps) {
  const { t } = useTranslation();
  const isDark = appearance === "dark";
  const label = isDark ? t("theme.toggleLight") : t("theme.toggleDark");

  return (
    <Tooltip content={label} side="bottom">
      <IconButton
        variant="ghost"
        color="gray"
        size="2"
        onClick={onToggle}
        aria-label={label}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </IconButton>
    </Tooltip>
  );
}
