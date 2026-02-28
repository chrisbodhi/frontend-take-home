import { Button, Flex, Table, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

interface TablePaginationRowProps {
  colSpan: number;
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

export function TablePaginationRow({
  colSpan,
  page,
  pages,
  onPageChange,
}: TablePaginationRowProps) {
  const { t } = useTranslation();

  if (pages <= 1) return null;

  return (
    <Table.Row>
      <Table.Cell colSpan={colSpan}>
        <Flex justify="end" gap="2">
          <Button
            size="1"
            variant={page <= 1 ? "soft" : "outline"}
            color="gray"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <Text weight="bold">{t("pagination.previous")}</Text>
          </Button>
          <Button
            size="1"
            variant={page >= pages ? "soft" : "outline"}
            color="gray"
            disabled={page >= pages}
            onClick={() => onPageChange(page + 1)}
          >
            <Text weight="bold">{t("pagination.next")}</Text>
          </Button>
        </Flex>
      </Table.Cell>
    </Table.Row>
  );
}
