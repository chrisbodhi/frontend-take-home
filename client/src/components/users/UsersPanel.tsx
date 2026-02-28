import { useCallback } from "react";
import { Box, Button, Flex } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { useUsers } from "../../api/users";
import { useRolesLookup } from "../../api/roles";
import { SearchInput } from "../shared/SearchInput";
import { Pagination } from "../shared/Pagination";
import { ErrorBanner } from "../shared/ErrorBanner";
import { UsersTable } from "./UsersTable";

interface UsersPanelProps {
  page: number;
  search: string;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
}

export function UsersPanel({
  page,
  search,
  onPageChange,
  onSearchChange,
}: UsersPanelProps) {
  const { t } = useTranslation();
  const usersQuery = useUsers(page, search);
  const { rolesById, isLoading: rolesLoading } = useRolesLookup();

  const isLoading = usersQuery.isLoading || rolesLoading;

  const handleSearch = useCallback(
    (value: string) => {
      // Reset to page 1 when searching
      onSearchChange(value);
      onPageChange(1);
    },
    [onSearchChange, onPageChange],
  );

  return (
    <Box>
      <Flex gap="3" mb="4" align="center">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder={t("users.searchPlaceholder")}
        />
        <Button disabled style={{ flexShrink: 0 }}>
          <PlusIcon />
          {t("users.addUser")}
        </Button>
      </Flex>

      {usersQuery.isError ? (
        <ErrorBanner onRetry={() => usersQuery.refetch()} />
      ) : (
        <>
          <UsersTable
            users={usersQuery.data?.data ?? []}
            rolesById={rolesById}
            isLoading={isLoading}
            isFetching={usersQuery.isFetching}
            search={search}
          />
          {usersQuery.data && (
            <Pagination
              page={page}
              pages={usersQuery.data.pages}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
    </Box>
  );
}
