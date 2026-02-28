import { IconButton, Tooltip } from "@radix-ui/themes";
import { Moon, Sun } from "lucide-react";
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
    <Tooltip content={label}>
      <IconButton
        variant="ghost"
        color="gray"
        size="2"
        onClick={onToggle}
        aria-label={label}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </IconButton>
    </Tooltip>
  );
}
