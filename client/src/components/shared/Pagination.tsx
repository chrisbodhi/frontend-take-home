import { Button, Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pages, onPageChange }: PaginationProps) {
  const { t } = useTranslation();

  if (pages <= 1) return null;

  return (
    <Flex justify="end" gap="2" py="3" px="3">
      <Button
        variant={page <= 1 ? "soft" : "outline"}
        color="gray"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <Text weight="bold">{t("pagination.previous")}</Text>
      </Button>
      <Button
        variant={page >= pages ? "soft" : "outline"}
        color="gray"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        <Text weight="bold">{t("pagination.next")}</Text>
      </Button>
    </Flex>
  );
}
