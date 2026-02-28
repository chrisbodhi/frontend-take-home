import { Badge, Table, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { RoleNameEditor } from "./RoleNameEditor";
import { TableSkeleton } from "../shared/TableSkeleton";
import { TablePaginationRow } from "../shared/TablePaginationRow";
import type { Role } from "../../types";

interface RolesTableProps {
  roles: Role[];
  isLoading: boolean;
  isFetching: boolean;
  search: string;
  page?: number;
  pages?: number;
  onPageChange?: (page: number) => void;
}

function formatDate(iso: string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function RolesTable({
  roles,
  isLoading,
  isFetching,
  search,
  page,
  pages,
  onPageChange,
}: RolesTableProps) {
  const { t } = useTranslation();

  return (
    <Table.Root
      variant="surface"
      aria-label={t("roles.tableLabel")}
      aria-busy={isLoading || isFetching}
      style={{
        opacity: !isLoading && isFetching ? 0.6 : 1,
        transition: "opacity 150ms ease",
      }}
    >
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>
            {t("roles.columnName")}
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            {t("roles.columnDescription")}
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            {t("roles.columnType")}
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            {t("roles.columnCreated")}
          </Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {isLoading ? (
          <TableSkeleton rows={5} columns={4} />
        ) : roles.length === 0 ? (
          <Table.Row>
            <Table.Cell colSpan={4}>
              <Text color="gray" align="center" as="p">
                {search
                  ? t("roles.emptySearchState", { search })
                  : t("roles.emptyState")}
              </Text>
            </Table.Cell>
          </Table.Row>
        ) : (
          roles.map((role) => (
            <Table.Row key={role.id}>
              <Table.Cell>
                <RoleNameEditor roleId={role.id} currentName={role.name} />
              </Table.Cell>
              <Table.Cell>
                <Text color="gray">{role.description || "—"}</Text>
              </Table.Cell>
              <Table.Cell>
                {role.isDefault ? (
                  <Badge color="blue" variant="soft">
                    {t("roles.defaultBadge")}
                  </Badge>
                ) : null}
              </Table.Cell>
              <Table.Cell>
                <Text color="gray">{formatDate(role.createdAt)}</Text>
              </Table.Cell>
            </Table.Row>
          ))
        )}
        {!isLoading &&
          roles.length > 0 &&
          page != null &&
          pages != null &&
          onPageChange != null && (
            <TablePaginationRow
              colSpan={4}
              page={page}
              pages={pages}
              onPageChange={onPageChange}
            />
          )}
      </Table.Body>
    </Table.Root>
  );
}
