import { Table, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { UserRow } from "./UserRow";
import { TableSkeleton } from "../shared/TableSkeleton";
import { TablePaginationRow } from "../shared/TablePaginationRow";
import type { User, Role } from "../../types";

interface UsersTableProps {
  users: User[];
  rolesById: Map<string, Role>;
  isLoading: boolean;
  isFetching: boolean;
  search: string;
  page?: number;
  pages?: number;
  onPageChange?: (page: number) => void;
}

export function UsersTable({
  users,
  rolesById,
  isLoading,
  isFetching,
  search,
  page,
  pages,
  onPageChange,
}: UsersTableProps) {
  const { t } = useTranslation();

  return (
    <Table.Root
      variant="surface"
      style={{
        opacity: !isLoading && isFetching ? 0.6 : 1,
        transition: "opacity 150ms ease",
      }}
    >
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>
            {t("users.columnUser")}
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            {t("users.columnRole")}
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            {t("users.columnJoined")}
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell />
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {isLoading ? (
          <TableSkeleton rows={10} columns={3} showAvatar />
        ) : users.length === 0 ? (
          <Table.Row>
            <Table.Cell colSpan={4}>
              <Text color="gray" align="center" as="p">
                {search
                  ? t("users.emptySearchState", { search })
                  : t("users.emptyState")}
              </Text>
            </Table.Cell>
          </Table.Row>
        ) : (
          users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              role={rolesById.get(user.roleId)}
            />
          ))
        )}
        {!isLoading &&
          users.length > 0 &&
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
