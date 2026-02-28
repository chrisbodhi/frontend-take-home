import { useCallback } from "react";
import { Box, Flex } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { useRoles } from "../../api/roles";
import { SearchInput } from "../shared/SearchInput";
import { Pagination } from "../shared/Pagination";
import { ErrorBanner } from "../shared/ErrorBanner";
import { RolesTable } from "./RolesTable";

interface RolesPanelProps {
  page: number;
  search: string;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
}

export function RolesPanel({
  page,
  search,
  onPageChange,
  onSearchChange,
}: RolesPanelProps) {
  const { t } = useTranslation();
  const rolesQuery = useRoles(page, search);

  const handleSearch = useCallback(
    (value: string) => {
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
          placeholder={t("roles.searchPlaceholder")}
        />
      </Flex>

      {rolesQuery.isError ? (
        <ErrorBanner onRetry={() => rolesQuery.refetch()} />
      ) : (
        <>
          <RolesTable
            roles={rolesQuery.data?.data ?? []}
            isLoading={rolesQuery.isLoading}
            isFetching={rolesQuery.isFetching}
            search={search}
          />
          {rolesQuery.data && (
            <Pagination
              page={page}
              pages={rolesQuery.data.pages}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
    </Box>
  );
}
