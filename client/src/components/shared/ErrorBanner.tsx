import { Callout, Button, Flex } from "@radix-ui/themes";
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
      <Flex direction="column" align="start" gap="2">
        <Callout.Text>{message ?? t("error.generic")}</Callout.Text>
        {onRetry && (
          <Button variant="ghost" size="1" color="red" onClick={onRetry}>
            {t("error.retry")}
          </Button>
        )}
      </Flex>
    </Callout.Root>
  );
}
