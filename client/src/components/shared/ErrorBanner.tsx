import { Callout, Button } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";

interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  const { t } = useTranslation();

  return (
    <Callout.Root color="red" role="alert" mt="4">
      <Callout.Icon>
        <ExclamationTriangleIcon />
      </Callout.Icon>
      <Callout.Text>
        {message ?? t("error.generic")}{" "}
        {onRetry && (
          <Button variant="ghost" size="1" color="red" onClick={onRetry}>
            {t("error.retry")}
          </Button>
        )}
      </Callout.Text>
    </Callout.Root>
  );
}
