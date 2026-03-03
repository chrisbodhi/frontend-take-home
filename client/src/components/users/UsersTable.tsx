import { useRef, useCallback, useState } from "react";
import { Table, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { UserRow } from "./UserRow";
import { DeleteUserDialog } from "./DeleteUserDialog";
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
  const tableRef = useRef<HTMLDivElement>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const userToDeleteRef = useRef<User | null>(null);
  const didDeleteRef = useRef(false);

  const handleDeleteRequest = useCallback((user: User) => {
    userToDeleteRef.current = user;
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setDeleteDialogOpen(false);
    const user = userToDeleteRef.current;

    if (didDeleteRef.current) {
      // Row was deleted — focus the table so the next Tab reaches
      // the first remaining row's action button.
      didDeleteRef.current = false;
      setTimeout(() => {
        tableRef.current?.focus();
        setUserToDelete(null);
      }, 100);
    } else {
      // Dialog was cancelled — return focus to the user's action button
      const userName = user ? `${user.first} ${user.last}` : "";
      setTimeout(() => {
        const trigger = tableRef.current?.querySelector<HTMLElement>(
          `[aria-label="${t("users.userActionsLabel", { name: userName })}"]`
        );
        trigger?.focus();
        setUserToDelete(null);
      }, 100);
    }
  }, [t]);

  const handleAfterDelete = useCallback(() => {
    didDeleteRef.current = true;
    handleDialogClose();
  }, [handleDialogClose]);

  return (
    <>
      <Table.Root
        ref={tableRef}
        tabIndex={-1}
        variant="surface"
        aria-label={t("users.tableLabel")}
        aria-busy={isLoading || isFetching}
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
            <Table.ColumnHeaderCell width="0" />
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
                onDeleteRequest={handleDeleteRequest}
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

      {userToDelete && (
        <DeleteUserDialog
          user={userToDelete}
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            if (!open) handleDialogClose();
          }}
          onAfterDelete={handleAfterDelete}
        />
      )}
    </>
  );
}
