import { useCallback } from "react";
import { Box, Flex } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { useRoles } from "../../api/roles";
import { SearchInput } from "../shared/SearchInput";
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
      <Flex gap="2" mb="5" align="center">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder={t("roles.searchPlaceholder")}
          aria-label={t("roles.searchLabel")}
        />
      </Flex>

      {rolesQuery.isError ? (
        <ErrorBanner onRetry={() => rolesQuery.refetch()} />
      ) : (
        <RolesTable
          roles={rolesQuery.data?.data ?? []}
          isLoading={rolesQuery.isLoading}
          isFetching={rolesQuery.isFetching}
          search={search}
          page={page}
          pages={rolesQuery.data?.pages}
          onPageChange={onPageChange}
        />
      )}
    </Box>
  );
}
